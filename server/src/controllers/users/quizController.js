const { Exam, ExamQuestion, Question, QuestionOption, Result, ResultAnswer, UserParticipation, User, Class, Course, Classroom } = require('../../models/index');
const mammoth = require('mammoth');
const upload = require('../../middlewares/upload'); // Điều chỉnh đường dẫn tới file upload middleware của bạn
const fs = require('fs').promises;
// 1. Tạo bài thi (bao gồm câu hỏi và lựa chọn)
const createExam = async (req, res) => {
    const { title, classroom_id, questions, duration, start_time, hide_results } = req.body;
  
    console.log('Dữ liệu nhận được:', {
      title,
      classroom_id,
      questionsCount: questions?.length,
      duration,
      start_time,
      hide_results,
      hide_results_type: typeof hide_results
    });
  
    try {
      if (!title || !classroom_id || !duration) {
        console.error('Thiếu các trường bắt buộc:', { title, classroom_id, duration });
        return res.status(400).json({
          message: 'Cần cung cấp đầy đủ title, classroom_id và duration'
        });
      }
  
      if (questions && !Array.isArray(questions)) {
        console.error('Định dạng questions không hợp lệ:', typeof questions);
        return res.status(400).json({ message: 'Questions phải là một mảng' });
      }
  
      const durationValue = parseInt(duration) || 60;
      const startTimeValue = start_time ? new Date(start_time) : new Date();
      const hideResultsValue = hide_results === "true" || hide_results === true;
  
      if (durationValue < 1) {
        console.error('Duration không hợp lệ:', durationValue);
        return res.status(400).json({ message: 'Duration phải lớn hơn hoặc bằng 1 phút' });
      }
  
      if (start_time && isNaN(new Date(start_time).getTime())) {
        console.error('start_time không hợp lệ:', start_time);
        return res.status(400).json({ message: 'start_time phải là định dạng ngày giờ hợp lệ (ISO)' });
      }
  
      const exam = await Exam.create({
        title,
        classroom_id,
        duration: durationValue,
        start_time: startTimeValue,
        hide_results: hideResultsValue,
      });
  
      let savedQuestions = [];
      if (questions && questions.length > 0) {
        const examQuestions = [];
  
        for (const q of questions) {
          if (!q.content || !q.options || !Array.isArray(q.options)) {
            console.error('Dữ liệu câu hỏi không hợp lệ:', q);
            return res.status(400).json({ message: 'Mỗi câu hỏi phải có nội dung và mảng lựa chọn' });
          }
  
          const question = await Question.create({ content: q.content });
          const options = q.options.map(opt => {
            if (!opt.content || typeof opt.is_correct !== 'boolean') {
              throw new Error('Mỗi lựa chọn phải có nội dung và giá trị is_correct (boolean)');
            }
            return {
              question_id: question.question_id,
              content: opt.content,
              is_correct: opt.is_correct,
            };
          });
          const savedOptions = await QuestionOption.bulkCreate(options);
  
          examQuestions.push({
            exam_id: exam.exam_id,
            question_id: question.question_id,
          });
  
          savedQuestions.push({
            question_id: question.question_id,
            content: question.content,
            options: savedOptions.map(opt => ({
              content: opt.content,
              is_correct: opt.is_correct,
            })),
          });
        }
  
        await ExamQuestion.bulkCreate(examQuestions);
      }
  
      // Chuyển exam thành plain object và thêm questions
      const examData = exam.toJSON(); // hoặc exam.get({ plain: true }) tùy phiên bản Sequelize
      examData.questions = savedQuestions;
  
      res.status(201).json({ message: 'Tạo bài thi thành công', exam: examData });
    } catch (error) {
      console.error('Lỗi khi tạo bài thi:', {
        message: error.message,
        stack: error.stack,
        details: error,
      });
      res.status(500).json({ message: 'Lỗi khi tạo bài thi', error: error.message });
    }
  };
// Lấy danh sách bài thi trong lớp học nhưng KHÔNG bao gồm câu hỏi
const getExamsByClassroomSimple = async (req, res) => {
    const { classroom_id } = req.params;
    try {
        const exams = await Exam.findAll({
            where: { classroom_id },
            attributes: ['exam_id', 'title', 'classroom_id', 'duration', 'start_time', 'hide_results', 'created_at']
        });
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
};

// 2. Lấy danh sách bài thi trong lớp học
const getExamsByClassroom = async (req, res) => {
    const { classroom_id } = req.params;
    try {
        const exams = await Exam.findAll({
            where: { classroom_id },
            include: [
                {
                    model: Question,
                    through: { attributes: [] },
                    include: [
                        {
                            model: QuestionOption,
                            as: 'options', // Đảm bảo alias là 'options'
                        },
                    ],
                },
            ],
        });
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
};
// 3. Lấy chi tiết bài thi (bao gồm câu hỏi và lựa chọn)
const getExamDetails = async (req, res) => {
    const { exam_id } = req.params;
    try {
        const exam = await Exam.findByPk(exam_id, {
            include: [{
                model: Question,
                through: ExamQuestion,
                include: [{
                    model: QuestionOption,
                    as: 'options'}
                ],
            }],
        });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam details', error: error.message });
    }
};
//nộp bài thi
const submitExam = async (req, res) => {
    const { exam_id, answers, user_id } = req.body;
    console.log('Dữ liệu nộp bài:', { exam_id, answers, user_id });

    try {
        if (!user_id) {
            return res.status(400).json({ message: "user_id là bắt buộc" });
        }

        const exam = await Exam.findByPk(exam_id, {
            include: [{
                model: Question,
                through: { attributes: [] }, // Loại bỏ thuộc tính thừa từ ExamQuestion
                include: [{
                    model: QuestionOption,
                    as: 'options', // Thêm alias 'options'
                }],
            }],
        });
        if (!exam) {
            return res.status(404).json({ message: "Không tìm thấy bài thi" });
        }

        const participation = await UserParticipation.findOne({
            where: {
                user_id: user_id,
                classroom_id: exam.classroom_id,
            },
        });
        if (!participation) {
            return res.status(403).json({ message: "Bạn không tham gia lớp học này" });
        }

        const existingResult = await Result.findOne({
            where: {
                exam_id,
                participate_id: participation.participate_id,
            },
        });
        if (existingResult) {
            return res.status(403).json({
                message: "Bạn đã nộp bài thi này rồi. Chỉ được nộp một lần.",
            });
        }

        let score = 0;
        const totalQuestions = exam.Questions.length;
        const resultAnswers = [];

        for (const question of exam.Questions) {
            const selectedOptionId = answers[question.question_id];
            const correctOption = question.options.find((opt) => opt.is_correct); // Sử dụng 'options'
            if (selectedOptionId && correctOption && selectedOptionId === correctOption.option_id) {
                score++;
            }
            resultAnswers.push({
                question_id: question.question_id,
                selected_option_id: selectedOptionId || null, // Ghi nhận cả khi không chọn
            });
        }

        const result = await Result.create({
            exam_id,
            participate_id: participation.participate_id,
            score: (score / totalQuestions) * 100,
        });

        const resultAnswerData = resultAnswers.map((answer) => ({
            result_id: result.result_id,
            question_id: answer.question_id,
            selected_option_id: answer.selected_option_id,
        }));
        await ResultAnswer.bulkCreate(resultAnswerData);

        res.json({ message: "Nộp bài thành công", score: result.score });
    } catch (error) {
        console.error('Lỗi khi nộp bài:', error);
        res.status(500).json({ message: "Lỗi khi nộp bài thi", error: error.message });
    }
};

// 5. Xem kết quả bài thi cá nhân
const getResult = async (req, res) => {
    const { exam_id } = req.params;
    try {
        const exam = await Exam.findByPk(exam_id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const participation = await UserParticipation.findOne({
            where: { user_id: req.user.id, classroom_id: exam.classroom_id },
        });
        if (!participation) {
            return res.status(403).json({ message: 'Bạn không tham gia lớp học này' });
        }

        const result = await Result.findOne({
            where: { exam_id, participate_id: participation.participate_id },
            include: [
                {
                    model: ResultAnswer,
                    include: [
                        {
                            model: Question,
                            include: [
                                {
                                    model: QuestionOption,
                                    as: 'options', // Sử dụng alias 'options'
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy kết quả', error: error.message });
    }
};

// 6. Xem tất cả kết quả của bài thi
const getExamResults = async (req, res) => {
    const { exam_id } = req.params;
    try {
        const results = await Result.findAll({
            where: { exam_id },
            include: [
                { model: UserParticipation, include: [User] },
                ResultAnswer,
            ],
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam results', error: error.message });
    }
};
const getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.findAll({
            attributes: [
                'classroom_id',
                'class_id',
                'course_id',
            ],
            include: [
                {
                    model: Class,
                    attributes: ['class_name'],
                },
                {
                    model: Course,
                    attributes: ['course_name', 'course_code'],
                }
            ]
        });

        res.json({
            message: 'Classrooms retrieved successfully',
            data: classrooms
        });
    } catch (error) {
        console.error('Error fetching classrooms:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Error fetching classrooms',
            error: error.message
        });
    }
};

const importExamFromWord = async (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err.message);
            return res.status(400).json({ message: 'Error uploading file', error: err.message });
        }

        const { title, classroom_id, duration, start_time, hide_results } = req.body;
        const filePath = req.file?.path;

        console.log('Request body:', {
            title,
            classroom_id,
            duration,
            start_time,
            hide_results,
            hide_results_type: typeof hide_results,
            file: req.file ? req.file.originalname : 'No file'
        });

        try {
            // Kiểm tra các trường bắt buộc
            if (!title || !classroom_id || !duration) {
                console.error('Missing required fields:', { title, classroom_id, duration });
                return res.status(400).json({ message: 'Title, classroom_id, and duration are required' });
            }
            if (!filePath) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const parsedDuration = parseInt(duration);
            if (isNaN(parsedDuration) || parsedDuration < 1) {
                console.error('Invalid duration:', duration);
                return res.status(400).json({ message: 'Duration must be an integer greater than or equal to 1 minute' });
            }

            const startTimeValue = start_time ? new Date(start_time) : new Date();
            if (start_time && isNaN(startTimeValue.getTime())) {
                console.error('Invalid start_time:', start_time);
                return res.status(400).json({ message: 'start_time must be a valid ISO date format' });
            }

            const hideResultsValue = hide_results === "true" || hide_results === true;

            // Tạo bài thi
            console.log('Creating exam with:', {
                title,
                classroom_id: parseInt(classroom_id),
                duration: parsedDuration,
                start_time: startTimeValue,
                hide_results: hideResultsValue
            });
            const exam = await Exam.create({
                title,
                classroom_id: parseInt(classroom_id),
                duration: parsedDuration,
                start_time: startTimeValue,
                hide_results: hideResultsValue,
            });
            console.log('Exam created:', {
                exam_id: exam.exam_id,
                title: exam.title,
                duration: exam.duration,
                start_time: exam.start_time,
                hide_results: exam.hide_results
            });

            // Đọc nội dung từ file Word
            const { value: rawText } = await mammoth.extractRawText({ path: filePath });
            console.log('Extracted text:', rawText);

            // Phân tích nội dung file Word
            const questions = parseWordContent(rawText);
            if (!questions.length) {
                await exam.destroy();
                return res.status(400).json({ message: 'No valid questions found in the file' });
            }

            const examQuestions = [];
            const questionDetails = []; // Lưu chi tiết câu hỏi để trả về
            for (const q of questions) {
                if (!q.content || !q.options || !Array.isArray(q.options)) {
                    console.error('Invalid question data:', q);
                    return res.status(400).json({ message: 'Each question must have content and options array' });
                }

                console.log('Creating question:', { content: q.content, optionsCount: q.options.length });
                const question = await Question.create({
                    content: q.content,
                });
                console.log('Question created:', { question_id: question.question_id });

                console.log('Creating options for question:', question.question_id);
                const options = q.options.map(opt => {
                    if (!opt.content || typeof opt.is_correct !== 'boolean') {
                        throw new Error('Each option must have content and is_correct (boolean)');
                    }
                    return {
                        question_id: question.question_id,
                        content: opt.content,
                        is_correct: opt.is_correct,
                    };
                });
                const createdOptions = await QuestionOption.bulkCreate(options);
                console.log('Options created for question:', question.question_id);

                examQuestions.push({
                    exam_id: exam.exam_id,
                    question_id: question.question_id,
                });

                // Thêm chi tiết câu hỏi và các lựa chọn vào phản hồi
                questionDetails.push({
                    content: question.content,
                    options: createdOptions.map(opt => ({
                        content: opt.content,
                        is_correct: opt.is_correct,
                    })),
                });
            }

            console.log('Linking questions to exam:', { examQuestionsCount: examQuestions.length });
            await ExamQuestion.bulkCreate(examQuestions);
            console.log('Exam questions linked successfully');

            // Trả về thông tin bài thi kèm danh sách câu hỏi
            res.status(201).json({
                message: 'Exam created successfully',
                exam: {
                    exam_id: exam.exam_id,
                    title: exam.title,
                    classroom_id: exam.classroom_id,
                    duration: exam.duration,
                    start_time: exam.start_time,
                    hide_results: exam.hide_results,
                    created_at: exam.created_at,
                    questions: questionDetails, // Trả về danh sách câu hỏi
                },
            });
        } catch (error) {
            console.error('Error creating exam:', {
                message: error.message,
                stack: error.stack,
                details: error,
            });
            res.status(500).json({ message: 'Error creating exam', error: error.message });
        } finally {
            if (filePath) {
                try {
                    await fs.unlink(filePath);
                    console.log('Temporary file deleted:', filePath);
                } catch (unlinkError) {
                    console.error('Error deleting temporary file:', unlinkError.message);
                }
            }
        }
    });
};

// Hàm phân tích nội dung từ file Word với dấu * ở đầu lựa chọn đúng
const parseWordContent = (rawText) => {
    const questions = [];
    // Chuẩn hóa ký tự * và khoảng trắng
    const normalizedText = rawText
        .replace(/[\u2022\u25CF*]/g, '*') // Thay thế các ký tự bullet (•, ●) hoặc * đặc biệt thành *
        .replace(/\r\n/g, '\n') // Chuẩn hóa xuống dòng
        .replace(/\n+/g, '\n') // Chuẩn hóa nhiều xuống dòng thành một
        .replace(/\s+/g, ' '); // Chuẩn hóa khoảng trắng

    // Tách các khối câu hỏi dựa trên số thứ tự
    const questionBlocks = normalizedText.split(/(?=\d+\.\s)/).filter(block => block.trim());

    for (const block of questionBlocks) {
        // Lấy nội dung câu hỏi (phần trước *a) hoặc các lựa chọn)
        const questionMatch = block.match(/^\d+\.\s*([^?]+\?)/);
        if (questionMatch) {
            const questionContent = questionMatch[1].trim();
            const optionsText = block.slice(questionMatch[0].length).trim();
            // Tách các lựa chọn dựa trên *a), a), b), c), ...
            const options = optionsText.match(/[*]?\w\)\s*[^()*]+?(?=\s*[*]?\w\)|$)/g) || [];

            if (options.length > 0) {
                const question = {
                    content: questionContent,
                    options: [],
                };

                for (const opt of options) {
                    const optionMatch = opt.match(/^([*]?\w\)\s*)(.+)/);
                    if (optionMatch) {
                        const isCorrect = optionMatch[1].startsWith('*');
                        const optionText = optionMatch[2].trim();
                        console.log('Option match:', {
                            group1: optionMatch[1],
                            group2: optionText,
                            includesStar: isCorrect,
                        });
                        question.options.push({
                            content: optionText,
                            is_correct: isCorrect,
                        });
                    }
                }

                questions.push(question);
            }
        }
    }

    console.log('Parsed questions:', JSON.stringify(questions, null, 2));
    return questions;
};
module.exports = {
    createExam,
    getExamsByClassroom,
    getExamDetails,
    submitExam,
    getResult,
    getExamResults,
    getAllClassrooms,
    importExamFromWord,
    getExamsByClassroomSimple
};