import React, { useState } from 'react';

export const Comment = ({ comment, addReply }) => {
    const [replyText, setReplyText] = useState('');
    const [showReplyInput, setShowReplyInput] = useState(false);

    const handleSubmitReply = (e) => {
        e.preventDefault();
        addReply(comment.id, replyText);
        setReplyText('');
        setShowReplyInput(false);
    };

    const formatDate = (date1) => {
        const date = new Date(date1);
    
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        return `${hours}:${minutes} ${day}.${month}.${year}`;
    };

    return (
        <div className="comment">
            <p>{comment.from.name}</p>
            <p>{comment.message}</p>
            <p>{formatDate(comment.created_time)}</p>

            <button onClick={() => setShowReplyInput(!showReplyInput)}>Reply</button>
            {showReplyInput && (
                <form onSubmit={handleSubmitReply}>
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                    />
                    <button type="submit">Submit Reply</button>
                </form>
            )}
            {comment.replies && comment.replies.map(reply => (
                <Comment key={reply.id} comment={reply} addReply={addReply} />
            ))}
        </div>
    );
};