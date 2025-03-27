import { React } from "react";
import EditComponent from "./EditComponent";

function EntryRow({ expense, isEditing, onDelete, onEdit, onCloseEdit }) {
  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td className="px-6 py-4">{expense.amount}</td>
      <td className="px-6 py-4">{expense.description}</td>
      <td className="px-6 py-4">{expense.category}</td>
      <td className="px-6 py-4">{expense.date}</td>
      <td className="px-6 py-4 flex space-x-2">
        <button
          onClick={() => onDelete(expense.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
        <button
          onClick={() => onEdit(expense.id)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
        {isEditing && (
          <EditComponent
            id={expense.id}
            initialData={expense}
            onClose={onCloseEdit}
          />
        )}
      </td>
    </tr>
  );
}

export default EntryRow;
