// src/components/admin/ClassroomTable.js
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ClassroomTable = ({ classrooms, columns, actions, onActionClick }) => {
  return (
    <>
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-teal-500 to-cyan-500">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.label}
                  className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-widest cursor-pointer"
                  onClick={col.onSort ? () => col.onSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortIcon}
                  </div>
                </th>
              ))}
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-widest">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classrooms.map((classroom, index) => (
              <tr
                key={classroom.classroom_id}
                className={`transition-all duration-300 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-teal-50`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 sm:px-6 py-4 sm:py-5 text-sm text-gray-700">
                    {col.render(classroom)}
                  </td>
                ))}
                <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-sm flex gap-3 sm:gap-4">
                  {actions.map((action) => (
                    <button
                      key={action.type}
                      onClick={() => onActionClick(action.type, classroom)}
                      className={action.className}
                      title={action.title}
                    >
                      {action.icon}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden space-y-4 p-4">
        {classrooms.map((classroom) => (
          <div
            key={classroom.classroom_id}
            className="bg-gray-50 p-4 rounded-xl shadow-md transition-all duration-300 hover:bg-teal-50"
          >
            <div className="space-y-2">
              {columns.map((col) => (
                <p key={col.key} className="text-sm text-gray-700">
                  <span className="font-semibold">{col.label}:</span> {col.render(classroom)}
                </p>
              ))}
              <div className="flex gap-3 pt-2">
                {actions.map((action) => (
                  <button
                    key={action.type}
                    onClick={() => onActionClick(action.type, classroom)}
                    className={action.className}
                    title={action.title}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ClassroomTable;