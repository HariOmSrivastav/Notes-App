import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import NoteCard from '../../components/Cards/NoteCard';
import { MdAdd } from 'react-icons/md';
import AddEditNotes from './AddEditNotes';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axiosInstance from '../../utils/axiosInstance';
import Toast from '../../components/ToastMessage/Toast';
import EmptyCard from '../../components/EmptyCard/EmptyCard';
import AddNotesImg from '../../assets/add-note-svgrepo-com.svg';
import NoData from '../../assets/no-data-icon.svg'

const Home = () => {
    const [openAddEditModal, setOpenAddEditModal] = useState({
        isShown: false,
        type: 'add',
        data: null,
    });

    const [showToastMsg, setShowToastMsg] = useState({
        isShown: false,
        type: '',
        message: '',
    });

    const [allNotes, setAllNotes] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [isSearch, setIsSearch] = useState(false);

    const navigate = useNavigate();

    // Show toast message
    const showToastMessage = (message, type) => {
        setShowToastMsg({
            isShown: true,
            message,
            type,
        });

        setTimeout(() => {
            setShowToastMsg({ isShown: false, message: '', type: '' });
        }, 3000); // Auto-hide after 3 seconds
    };

    // Get all notes
    const getAllNotes = async () => {
        try {
            const response = await axiosInstance.get('https://notes-app-068y.onrender.com/get-all-notes');
            if (response.data && response.data.notes) {
                setAllNotes(response.data.notes);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    // Get user info
    const getUserInfo = async () => {
        try {
            const response = await axiosInstance.get('https://notes-app-068y.onrender.com/get-user');
            if (response.data && response.data.user) {
                setUserInfo(response.data.user);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        }
    };

    // Handle delete note
    const deleteNote = async (noteId) => {
        try {
            await axiosInstance.delete(`https://notes-app-068y.onrender.com/delete-note/${noteId}`);
            showToastMessage('Note Deleted Successfully', 'delete');
            getAllNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    // Handle edit note
    const handleEdit = (noteDetails) => {
        setOpenAddEditModal({
            isShown: true,
            data: noteDetails,
            type: 'edit',
        });
    };

    // Handle pin/unpin note
    const handlePinNote = async (noteId, isPinned) => {
        try {
            await axiosInstance.put(`https://notes-app-068y.onrender.com/update-note-pinned/${noteId}`, {
                isPinned: !isPinned,
            });
            getAllNotes();
        } catch (error) {
            console.error('Error pinning note:', error);
        }
    };

    // Search for a note
    const onSearchNote = async (query) => {
        try {
            const response = await axiosInstance.get('https://notes-app-068y.onrender.com/search-notes', {
                params: { query },
            });
            if (response.data && response.data.notes) {
                setIsSearch(true);
                setAllNotes(response.data.notes);
            }
        } catch (error) {
            console.error('Error searching notes:', error);
        }
    };

    const updateIsPinned = async(noteData) =>{
      const noteId = noteData._id;

      try {
          const response = await axiosInstance.put(`https://notes-app-068y.onrender.com/update-note-pinned/${noteId}`, {
               isPinned : !noteData.isPinned,
          });

          if (response.data && response.data.note) {
              showToastMessage ("Note Updated Successfully ")
              getAllNotes(); 
          }
      } catch (error) {
          console.log(error)
      }
    }

    const handleClearSearch = () =>{
      setIsSearch(false);
      getAllNotes(); 
    }

    useEffect(() => {
        getAllNotes();
        getUserInfo();
    }, []);

    return (
        <>
            <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch = {handleClearSearch} />
            <div className="container mx-auto">
                {allNotes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {allNotes.map((item) => (
                            <NoteCard
                                key={item._id}
                                title={item.title}
                                date={item.createdOn}
                                content={item.content}
                                tags={item.tags}
                                isPinned={item.isPinned}
                                onEdit={() => handleEdit(item)}
                                onDelete={() => deleteNote(item._id)}
                                onPinNote={() => updateIsPinned(item)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyCard
                        imgSrc={isSearch ? NoData : AddNotesImg}
                        message={isSearch ? `Oops! No Data found matching your search`
                          : `Start creating your first note! Click the 'Add' button to store your thoughts, 
                          ideas, and reminders. Let's get started.`}
                    />
                )}
            </div>

            {/* Add Note Button */}
            <button
                className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500 hover:bg-blue-600 fixed right-10 bottom-10"
                onClick={() => setOpenAddEditModal({ isShown: true, type: 'add', data: null })}
            >
                <MdAdd className="text-[32px] text-white" />
            </button>

            {/* Add/Edit Note Modal */}
            <Modal
                isOpen={openAddEditModal.isShown}
                onRequestClose={() => setOpenAddEditModal({ isShown: false, type: 'add', data: null })}
                style={{
                    overlay: { backgroundColor: 'rgba(0,0,0,0.2)' },
                }}
                className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
            >
                <AddEditNotes
                    type={openAddEditModal.type}
                    noteData={openAddEditModal.data}
                    onClose={() => setOpenAddEditModal({ isShown: false, type: 'add', data: null })}
                    getAllNotes={getAllNotes}
                    showToastMessage={showToastMessage}
                />
            </Modal>

            {/* Toast Message */}
            <Toast
                isShown={showToastMsg.isShown}
                message={showToastMsg.message}
                type={showToastMsg.type}
                onClose={() => setShowToastMsg({ isShown: false, message: '', type: '' })}
            />
        </>
    );
};

export default Home;