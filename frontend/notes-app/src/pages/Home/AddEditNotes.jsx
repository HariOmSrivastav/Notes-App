import React, { useState } from 'react';
import TagInput from '../../components/Input/TagInput';
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosInstance';

const AddEditNotes = ({ noteData, type, getAllNotes, onClose , showToastMessage }) => {
    const [title, setTitle] = useState(noteData?.title || "");
    const [content, setContent] = useState(noteData?.content || "");
    const [tags, setTags] = useState(noteData?.tags || []);
    const [error, setError] = useState(null);

    // Add note
    const addNewNote = async () => {
        try {
            const response = await axiosInstance.post("https://notes-app-068y.onrender.com/add-note", {
                title,
                content,
                tags,
            });

            if (response.data && response.data.note) {
                showToastMessage("Note Added Successfully")
                getAllNotes();
                onClose();
            }
        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            }
        }
    }

    // Edit note
    const editNote = async () => {
        const noteId = noteData._id;

        try {
            const response = await axiosInstance.put(`https://notes-app-068y.onrender.com/edit-note/${noteId}`, {
                title,
                content,
                tags,
            });

            if (response.data && response.data.note) {
                showToastMessage ("Note Updated Successfully ")
                getAllNotes();
                onClose();
            }
        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            }
        }
    }

    const handleAddNote = () => {
        // Remove unnecessary console.log and reset
        if (!title.trim() || !content.trim()) {
            setError('Title and content cannot be empty!');
            return;
        }

        if (type === "edit") {
            editNote();
        } else {
            addNewNote();
        }
    };

    return (
        <div className="relative p-6 bg-white rounded-md shadow-lg">
            <button
                className='w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-500'
                onClick={onClose}
            >
                <MdClose className='text-xl text-slate-400' />
            </button>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* Title Input */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    className="text-2xl text-slate-950 outline-none border border-gray-300 p-2 rounded"
                    placeholder="Go to GYM at 5"
                    value={title}
                    onChange={({ target }) => setTitle(target.value)}
                />
            </div>

            {/* Content Input */}
            <div className="flex flex-col gap-2 mt-4">
                <label className="text-sm font-medium text-gray-700">Content</label>
                <textarea
                    className="text-sm text-slate-950 outline-none bg-slate-50 border border-gray-300 p-2 rounded resize-none"
                    placeholder="Write your note here..."
                    rows={6}
                    value={content}
                    onChange={({ target }) => setContent(target.value)}
                />
            </div>

            {/* Tags Input */}
            <div className="mt-3">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <TagInput tags={tags} setTags={setTags} />
            </div>

            {/* Submit Button */}
            <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium mt-5 p-3 rounded-md w-full transition-all"
                onClick={handleAddNote}
            >
                {type === "edit" ? "UPDATE" : "ADD"}
            </button>
        </div>
    );
};

export default AddEditNotes;