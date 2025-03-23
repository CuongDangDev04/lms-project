const path = require('path'); // Add this import
const fs = require('fs'); // Add this import
const fsPromises = fs.promises; // Add this import
const archiver = require('archiver');
const { Lecture, UserParticipation, Classroom, User } = require('../../models/index');

const uploadLecture = async (req, res) => {
  try {
    const files = validateFiles(req.files);
    // lặp và lưu file paths/names vào bên trong mảng vừa tạo
    const { filePaths, fileNames } = extractFileData(files);
    //lấy user_id từ JWT 
    const user_id = req.user.id;
    const { classroom_id } = req.params;
    const { title, description } = req.body; // Lấy từ form-data
    const participation = await fetchParticipationOnClassroom(classroom_id, user_id);
    if (!participation) {
      return sendErrorResponse(res, 404, 'User not participating in this classroom');
    }
    const lecture = await createLecture({
      user_id,
      participation,
      title,
      description,
      filePaths,
      fileNames
    });
    if (!lecture || !lecture.lecture_id) {
      return sendErrorResponse(res, 500, 'Failed to create lecture record');
    }
    return sendSuccessResponse(res, 201, 'Lecture uploaded successfully', lecture);
  } catch (err) {
    return sendErrorResponse(res, 500, 'Error uploading lecture', err.message);
  }
};

const validateFiles = (files, res) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    sendErrorResponse(res, 400, 'Please upload at least one file');
    throw new Error('No files uploaded'); // Stop execution
  }
  return files;
};
const createLecture = async ({ user_id, participation, title, description, filePaths, fileNames }) => {
  return await Lecture.create({
    user_id,
    user_participation_id: participation.participate_id,
    title: title || null,
    description: description || null,
    file_path: JSON.stringify(filePaths),
    file_name: JSON.stringify(fileNames),
    upload_date: new Date(),
  });
}
const extractFileData = (files) => (
  {
    filePaths: files.map(file => file.path),
    fileNames: files.map(file => file.originalname)
  }
)



const fetchParticipationOnClassroom = async (classroom_id, user_id) => {
  return await UserParticipation.findOne({
    where: { user_id, classroom_id }
  });
}


//lấy ra giáo viên đang dạy lớp nào 
const showLectureOnClassroom = async (req, res) => {
  try {
    const classroom_id = req.params.classroom_id;
    const lectures = await fetchLecturesClassroom(classroom_id);
    if (!lectures || lectures.length === 0) {
      return sendErrorResponse(res, 404, 'No lectures found for this classroom');
    }
    const enhancedLectures = enhenceLectureData(lectures);
    return sendSuccessResponse(res, 200, 'Lectures retrieved', enhancedLectures);
  } catch (err) {
    return sendErrorResponse(res, 500, 'Error getting lectures', err.message);
  }
};
const enhenceLectureData = (lectures) => {
  return lectures.map(lecture => {
    const lectureData = lecture.get({ plain: true });
    lectureData.fileNames = parseFileNames(lecture.file_name);
    return lectureData;
  });
}

const parseFileNames = (fileName) => {
  try {
    return JSON.parse(fileName || '[]')
  } catch (err) {
    return
  }
}

//Lấy ra giáo viên đang dạy lớp nào 
const fetchLecturesClassroom = async (classroom_id) => {
  return await Lecture.findAll({
    include: [{
      model: UserParticipation,
      where: { classroom_id },
      include: [{
        model: User,
        attributes: ['role_id', 'username'],
        where: { role_id: 2 },
      }, {
        model: Classroom,
        attributes: ['classroom_id', "course_id"]
      }]
    }]
  });
}



const getUserParticipationId = async (req, res) => {
  try {
    const { userId, classroomId } = req.params;

    // Validate input
    if (!userId || !classroomId) {
      return sendErrorResponse(res, 400, 'Please provide both user ID and classroom ID');
    }

    // Lấy ra các props của một user participation  cụ thể 
    const userParticipation = await fetchUserParticipation(userId, classroomId)
    console.log(userParticipation)

    if (!userParticipation) {
      return sendErrorResponse(res, 404, 'User participation not found');
    }

    // Return the user participation ID
    return sendSuccessResponse(res, 200, 'User participation ID retrieved', userParticipation);

  } catch (error) {
    console.error('Error getting user participation ID:', error);
    return sendErrorResponse(res, 500, 'Error getting user participation ID', error.message);
  }
};

const fetchUserParticipation = async (userId, classroomId) => {
  return await UserParticipation.findOne({
    where: {
      user_id: userId,
      classroom_id: classroomId
    }
  });
}

const sendErrorResponse = (res, statusCode, message, errorDetail = null) => {
  const response = {
    success: false,
    message
  };
  if (errorDetail) response.error = errorDetail;
  return res.status(statusCode).json(response);
};

// Helper function for consistent success responses
const sendSuccessResponse = (res, status, message, data) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

const parseFilePath = (filePathString) => {
  try {
    return JSON.parse(filePathString) || [];
  } catch (err) {
    console.error('Error parsing file paths:', err);
    return [];
  }
};


const DeleteLectureOnId = async (req, res) => {
  try {
    const { lecture_id } = req.params; // Extract lecture_id correctly

    const lecture = await Lecture.findOne({ where: { lecture_id } }); // Fix where clause
    if (!lecture) throw new Error('Lecture not found!');

    // Delete files
    const filePaths = parseFilePath(lecture.file_path);

    // Xóa các file vật lý
    for (const filePath of filePaths) {
      try {
        const absolutePath = path.resolve(filePath);
        await fsPromises.access(absolutePath);
        await fsPromises.unlink(absolutePath);
      } catch (err) {
        console.error(`Không thể xóa file ${filePath}:`, err.message);
      }
    }

    // Delete record
    await lecture.destroy();

    res.status(200).json({ message: 'Lecture deleted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const updateLecture = async (req, res) => {
  try {
    const { lecture_id } = req.params;
    const { title, description, removeFileIndices = [] } = req.body;
    const newFiles = req.files || [];

    const lecture = await Lecture.findOne({ where: { lecture_id } });
    if (!lecture) throw new Error('Lecture not found!');

    // Parse existing paths and names
    const existingFilePaths = JSON.parse(lecture.file_path || '[]');
    const existingFileNames = JSON.parse(lecture.file_name || '[]');

    // Ensure removeFileIndices is an array
    let indices = removeFileIndices;
    if (typeof removeFileIndices === 'string') {
      try {
        indices = JSON.parse(removeFileIndices);
      } catch (error) {
        indices = [];
      }
    }

    // Validate indices is an array
    if (!Array.isArray(indices)) {
      indices = [];
    }

    // Delete old files
    indices.forEach(index => {
      if (index >= 0 && index < existingFilePaths.length) {
        const filePath = existingFilePaths[index];
        const absolutePath = path.resolve(process.cwd(), filePath);
        if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
      }
    });

    // Filter out removed files
    const remainingFilePaths = existingFilePaths.filter((_, index) => !indices.includes(index));
    const remainingFileNames = existingFileNames.filter((_, index) => !indices.includes(index));

    // Add new files
    const newFilePaths = newFiles.map(file => file.path);
    const newFileNames = newFiles.map(file => file.originalname);

    // Update lecture with combined data
    const updatedFilePaths = [...remainingFilePaths, ...newFilePaths];
    const updatedFileNames = [...remainingFileNames, ...newFileNames];

    // Save changes
    lecture.file_path = JSON.stringify(updatedFilePaths);
    lecture.file_name = JSON.stringify(updatedFileNames);
    lecture.title = title || lecture.title;
    lecture.description = description || lecture.description;
    await lecture.save();

    // Prepare response with file data for frontend
    const responseData = {
      message: 'Lecture updated!',
      lecture: {
        ...lecture.get({ plain: true }),
        fileNames: updatedFileNames
      }
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Error updating lecture', error: err.message });
  }
};
// Add retrieval of lecture by ID
const getLectureById = async (req, res) => {
  try {
    const { lecture_id } = req.params;

    if (!lecture_id) {
      return res.status(400).json({ message: "Vui lòng cung cấp lecture_id." });
    }

    const lecture = await Lecture.findOne({ where: { lecture_id } });

    if (!lecture) {
      return res.status(404).json({ message: "Không tìm thấy bài giảng." });
    }

    res.status(200).json({
      lecture: lecture,
    });
  } catch (err) {
    console.error("Lỗi khi lấy thông tin bài giảng:", err);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy thông tin bài giảng." });
  }
}


const downloadLecture = async (req, res, next) => {
  try {
    const { lecture_id } = req.params;
    const { fileIndex } = req.query; // Lấy fileIndex từ query

    const lecture = await Lecture.findOne({ where: { lecture_id } });
    if (!lecture) throw new Error('Lecture not found!');

    const filePaths = JSON.parse(lecture.file_path || '[]');
    const fileNames = JSON.parse(lecture.file_name || '[]');

    if (filePaths.length === 0) throw new Error('No files found for this lecture!');

    // For debugging
    console.log('File paths:', filePaths);
    console.log('File names:', fileNames);

    if (fileIndex !== undefined) {
      // Tải từng file
      const index = parseInt(fileIndex, 10);
      if (isNaN(index) || index < 0 || index >= filePaths.length) {
        throw new Error('Invalid file index!');
      }

      const filePath = filePaths[index];
      const fileName = fileNames[index] || path.basename(filePath);

      const absolutePath = path.resolve(process.cwd(), filePath);
      console.log('Downloading file:', { fileName, absolutePath });

      if (!fs.existsSync(absolutePath)) {
        console.error(`File not found at: ${absolutePath}`);
        return res.status(404).json({ message: 'File not found on server' });
      }

      // Set appropriate MIME type based on file extension
      const mimeType = getMimeType(filePath);

      // Check if this is a video file and handle streaming
      if (mimeType.startsWith('video/')) {
        return streamVideo(req, res, absolutePath, fileName, mimeType);
      }

      // For non-video files, continue as before
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);

      const fileStream = fs.createReadStream(absolutePath);
      fileStream.pipe(res);

    } else {
      // Multiple files case - ZIP download
      if (filePaths.length === 1) {
        // Single file case
        const filePath = filePaths[0];
        const fileName = fileNames[0] || path.basename(filePath);

        const absolutePath = path.resolve(process.cwd(), filePath);
        console.log('Downloading single file:', { fileName, absolutePath });

        if (!fs.existsSync(absolutePath)) {
          console.error(`File not found at: ${absolutePath}`);
          return res.status(404).json({ message: 'File not found on server' });
        }

        const mimeType = getMimeType(filePath);
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);

        const fileStream = fs.createReadStream(absolutePath);
        fileStream.pipe(res);

      } else {
        // Multiple files - ZIP
        const zipFileName = `${lecture.title || 'lecture_' + lecture_id}.zip`;
        console.log('Creating ZIP archive:', zipFileName);

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(zipFileName)}`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', (err) => {
          console.error('Archive error:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error creating archive' });
          }
        });

        archive.pipe(res);

        for (let i = 0; i < filePaths.length; i++) {
          const filePath = filePaths[i];
          const fileName = fileNames[i] || `file_${i}${path.extname(filePath)}`;
          const absolutePath = path.resolve(process.cwd(), filePath);

          if (fs.existsSync(absolutePath)) {
            console.log(`Adding to ZIP: ${fileName}`);
            archive.file(absolutePath, { name: fileName });
          } else {
            console.warn(`File not found for ZIP: ${absolutePath}`);
          }
        }

        await archive.finalize();
      }
    }
  } catch (err) {
    console.error('Download error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    }
  }
};
// Helper function to determine MIME type
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm', // Thêm
    '.ogg': 'video/ogg',   // Thêm
    '.mp3': 'audio/mpeg',
    '.zip': 'application/zip',
    '.txt': 'text/plain',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};


const streamVideo = async (req, res, absolutePath, fileName, mimeType) => {
  try {
    // Get file stats
    const stat = fs.statSync(absolutePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    console.log('Video streaming request:', {
      absolutePath,
      fileName,
      mimeType,
      fileSize,
      hasRangeHeader: !!range
    });

    if (range) {
      // Handle range requests (used for seeking in videos)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range
      if (isNaN(start) || start < 0) {
        return res.status(416).send('Invalid range: start must be a non-negative number');
      }

      if (start >= fileSize) {
        return res.status(416).send('Range Not Satisfiable: start position beyond file size');
      }

      const chunksize = (end - start) + 1;
      console.log(`Streaming chunk ${start}-${end}/${fileSize} (${chunksize} bytes)`);

      // Set headers for partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType
      });

      // Create read stream for this chunk and pipe to response
      const fileStream = fs.createReadStream(absolutePath, { start, end });
      fileStream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).send('Error streaming video');
        }
      });

      fileStream.pipe(res);
    } else {
      // No range header - send entire file
      console.log(`Streaming entire file (${fileSize} bytes)`);

      // Set headers for full content
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes'
      });

      // Stream the entire file
      const fileStream = fs.createReadStream(absolutePath);
      fileStream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).send('Error streaming video');
        }
      });

      fileStream.pipe(res);
    }
  } catch (error) {
    console.error('Video streaming error:', error);
    if (!res.headersSent) {
      res.status(500).send('Error streaming video file');
    }
  }
};


module.exports = {
  uploadLecture,
  showLectureOnClassroom,
  getUserParticipationId,
  DeleteLectureOnId,
  updateLecture,  // Export the new function
  getLectureById,
  downloadLecture,
  streamVideo
};