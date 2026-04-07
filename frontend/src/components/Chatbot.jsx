import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);

  useEffect(() => {
    axios.get('/api/chatbot/questions').then(r => setQuestions(r.data || [])).catch(() => {});
  }, []);

  return (
    <>
      {/* Floating button */}
      <button className="chatbot-fab" onClick={() => { setOpen(o => !o); setSelectedIdx(null); }} title="Help">
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>🤖 BioTrack Help</span>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chatbot-body">
            {selectedIdx !== null ? (
              <div>
                <button className="chatbot-back" onClick={() => setSelectedIdx(null)}>← Back to questions</button>
                <div className="chatbot-q-bubble">{questions[selectedIdx].question}</div>
                <div className="chatbot-a-bubble">{questions[selectedIdx].answer}</div>
              </div>
            ) : (
              <div>
                <p className="chatbot-prompt">Choose a question:</p>
                {questions.map((q, i) => (
                  <button key={i} className="chatbot-question-btn" onClick={() => setSelectedIdx(i)}>
                    {q.question}
                  </button>
                ))}
                {questions.length === 0 && <p style={{ color: '#999' }}>Loading questions...</p>}
                <p className="chatbot-footer-note">
                  Don't see your question? Ask your teacher for help!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
