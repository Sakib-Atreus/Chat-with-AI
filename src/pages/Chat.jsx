import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import config from "../config";

const Chat = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  // Reference to the chat messages container
  const chatContainerRef = useRef(null);

  const { API_URL, API_KEY } = config;

  async function generateAnswer() {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user question to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: question, isUser: true },
    ]);

    try {
      const response = await axios({
        url: `${API_URL}?key=${API_KEY}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          contents: [
            {
              parts: [{ text: question }],
            },
          ],
        },
      });

      if (response.status === 200) {
        const data = response.data;

        if (
          data &&
          data.candidates &&
          data.candidates.length > 0 &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts.length > 0
        ) {
          const aiAnswer = data.candidates[0].content.parts[0].text;
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: aiAnswer, isUser: false },
          ]);
          setAnswer(aiAnswer);
        } else {
          setAnswer("No answer received.");
        }
      } else {
        setError(`API Error: ${response.status} - ${response.statusText}`);
        setAnswer("");
      }
    } catch (err) {
      console.error("Error generating answer:", err);
      setError(err.message || "An error occurred while generating the answer.");
      setAnswer("");
    } finally {
      setIsLoading(false);
      setQuestion("");
    }
  }

  const handleInputChange = (e) => {
    setQuestion(e.target.value);
  };

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Title at the top */}
      <div className="bg-white shadow-xl rounded-lg w-full max-w-5xl p-4 mb-6 mx-auto flex justify-center items-center flex-col">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 text-center">
          Chat with AI
        </h1>

        <p className="text-xs text-black">Ask AI Anything</p>
      </div>

      {/* Chat Messages in the middle */}
      <div
        ref={chatContainerRef} // Attach the reference
        className="flex-1 px-4 max-w-5xl mx-auto w-full overflow-y-auto max-h-[60vh] h-auto space-y-4 p-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 max-w-xs lg:max-w-lg md:max-w-lg rounded-lg ${
                message.isUser
                  ? "ps-5 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p
                className="whitespace-pre-wrap break-words"
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input and Button at the bottom */}
      <div className="p-4 bg-white shadow-xl rounded-lg w-full max-w-5xl mx-auto fixed bottom-0 left-0 right-0">
        <div className="flex flex-col">
          <label
            htmlFor="question"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Your Question:
          </label>
          <textarea
            id="question"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 h-24 resize-none"
            value={question}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                generateAnswer();
              }
            }}
            placeholder="Type your question here..."
          />
          <button
            onClick={generateAnswer}
            className={`bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 hover:from-purple-500 hover:via-blue-600 hover:to-teal-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 transition duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3 inline-block"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Thinking...
              </>
            ) : (
              "Get Answer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
