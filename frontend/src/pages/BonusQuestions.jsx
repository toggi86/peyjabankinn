import React, { useEffect, useRef, useState } from "react";
import api from "../api/client";

const BonusQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    load();
  }, []);

  const load = async () => {
    try {
      const q = await api.get("bonus-questions/");
      const a = await api.get("bonus-answers/");

      const answerMap = {};
      a.data.forEach((ans) => {
        answerMap[ans.question] = {
          answerId: ans.id,
          choiceId: ans.answer
        };
      });

      setQuestions(q.data);
      setAnswers(answerMap);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };


  const submitAnswer = async (questionId, choiceId) => {
    try {
      const existing = answers[questionId];

      if (existing) {
        await api.patch(`bonus-answers/${existing.answerId}/`, {
          answer: choiceId,
        });
      } else {
        await api.post("bonus-answers/", {
          question: questionId,
          answer: choiceId,
        });
      }

      load();
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    }
  };


  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 mt-6">
      <h1 className="text-3xl font-bold mb-6">Bonus Questions</h1>

      {questions.map((q) => (
        <div key={q.id} className="bg-white p-4 rounded shadow mb-5">
          <h2 className="text-xl font-semibold mb-3">{q.question}</h2>

          {q.choices.map((choice) => {
            const isSelected = answers[q.id]?.choiceId === choice.id;

            return (
              <button
                key={choice.id}
                onClick={() => submitAnswer(q.id, choice.id)}
                className={`block w-full text-left border p-2 my-1 rounded transition 
                  ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}
                `}
              >
                {choice.choice.choice}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default BonusQuestions;
