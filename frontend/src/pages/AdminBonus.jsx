import React, { useEffect, useState } from "react";
import api from "../api/client";

const AdminBonus = () => {
  const [questions, setQuestions] = useState([]);

  const [newQuestion, setNewQuestion] = useState("");
  const [newChoice, setNewChoice] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");

  const load = async () => {
    const res = await api.get("bonus-questions/");
    setQuestions(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const createQuestion = async () => {
    if (!newQuestion.trim()) return;
    await api.post("bonus-questions/", { question: newQuestion });
    setNewQuestion("");
    load();
  };

  const addChoice = async () => {
    if (!newChoice.trim() || !selectedQuestion) return;

    // Step 1: Create BonusChoices item
    const choice = await api.post("bonus-choices/", { choice: newChoice });

    // Step 2: Link it to the question
    await api.post("bonus-question-choices/", {
      question: selectedQuestion,
      choice: choice.data.id,
    });

    setNewChoice("");
    load();
  };

  const setCorrect = async (questionId, choiceId) => {
    await api.post(`bonus-questions/${questionId}/set_correct/`, {
      choice_id: choiceId,
    });
    load();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 mt-10">
      <h1 className="text-3xl font-bold mb-6">Admin — Bonus Questions</h1>

      {/* Create question */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Create Question</h2>
        <input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Question text..."
          className="border p-2 w-full rounded"
        />
        <button
          onClick={createQuestion}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Question
        </button>
      </div>

      {/* Add choice */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Add Choice to Question</h2>

        <select
          value={selectedQuestion}
          onChange={(e) => setSelectedQuestion(e.target.value)}
          className="border p-2 w-full rounded mb-2"
        >
          <option value="">Select question...</option>
          {questions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.question}
            </option>
          ))}
        </select>

        <input
          value={newChoice}
          onChange={(e) => setNewChoice(e.target.value)}
          placeholder="Choice text..."
          className="border p-2 w-full rounded"
        />

        <button
          onClick={addChoice}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Choice
        </button>
      </div>

      {/* List all questions */}
      {questions.map((q) => (
        <div
          key={q.id}
          className="bg-white p-4 rounded shadow mb-5 border-l-4 border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-3">{q.question}</h2>

          {q.choices.length === 0 && (
            <p className="text-gray-500 italic">No choices yet.</p>
          )}

          {q.choices.map((choice) => (
            <div
              key={choice.id}
              className="flex justify-between items-center border p-2 rounded mt-2"
            >
              <span>{choice.choice.choice}</span>

              <button
                onClick={() => setCorrect(q.id, choice.id)}
                className={`px-3 py-1 rounded 
                  ${
                    q.correct_answer?.id === choice.id
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                {q.correct_answer?.id === choice.id
                  ? "Correct Answer"
                  : "Set Correct"}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AdminBonus;
