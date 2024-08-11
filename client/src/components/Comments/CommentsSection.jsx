import React, { useState } from 'react'
import { Comment } from './Comment';

const CommentSection = ({ comments, postId }) => {
    const [newCommentText, setNewCommentText] = useState('');

    // const addComment = (text) => {
    //     const newComment = {
    //         id: Date.now(),
    //         text: text,
    //         replies: []
    //     };
    //     setComments([...comments, newComment]);
    // };


    // const addReply = (parentId, replyText) => {
    //     const updateComments = (comments) => {
    //         return comments.map(comment => {
    //             if (comment.id === parentId) {
    //                 return {
    //                     ...comment,
    //                     replies: [...comment.replies, { id: Date.now(), text: replyText, replies: [] }]
    //                 };
    //             }
    //             if (comment.replies) {
    //                 return { ...comment, replies: updateComments(comment.replies) };
    //             }
    //             return comment;
    //         });
    //     };

    //     setComments(updateComments(comments));
    // };

    const addReply = () => { }

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        // addComment(newCommentText);
        await fetch(`http://localhost:5001/api/facebook/comment/${postId}`, {
            method: "POST",
            body: newCommentText
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Error commenting: " + response.statusText);
            }
            window.location.reload();
        });
        setNewCommentText('');
    }; 


    if (!comments)return;

    return (
        <div className="comment-section">
            <form className='comment-form-section' onSubmit={handleSubmitComment}>
                <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a comment..."
                />
                <button type="submit">Submit</button>
            </form>
            {comments && comments.map(comment => (
                <Comment key={comment.id} comment={comment} addReply={addReply} />
            ))}
        </div>
    );
};

export default CommentSection;