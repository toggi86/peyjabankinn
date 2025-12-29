import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useCompetition } from "../context/CompetitionContext";

export default function BonusQuestions() {
  const { selectedCompetition } = useCompetition();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!selectedCompetition) return;

    setLoading(true);
    try {
      const [questionsRes, answersRes] = await Promise.all([
        api.get(`bonus-questions/?competition=${selectedCompetition}`),
        api.get(`bonus-answers/?competition=${selectedCompetition}`),
      ]);

      const answerMap = {};
      answersRes.data.forEach(ans => {
        answerMap[ans.question] = {
          answerId: ans.id,
          choiceId: ans.answer,
        };
      });

      setQuestions(questionsRes.data);
      setAnswers(answerMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuestions([]);
    setAnswers({});
    load();
  }, [selectedCompetition]);

  const submitAnswer = async (questionId, choiceId) => {
    try {
      const existing = answers[questionId];
      let res;

      if (existing) {
        res = await api.patch(
          `bonus-answers/${existing.answerId}/`,
          { answer: choiceId }
        );
      } else {
        res = await api.post("bonus-answers/", {
          question: questionId,
          answer: choiceId,
        });
      }

      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          answerId: res.data.id,
          choiceId,
        },
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    }
  };

  if (!selectedCompetition) {
    return <div className="text-center mt-10">Select a competition</div>;
  }

  if (loading) {
    return <div className="text-center mt-10">Loading bonus questions…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 mt-6">
      <h1 className="text-2xl font-bold mb-1">Bonus Questions</h1>

      <p className="text-sm text-gray-500 mb-4">
        Answered {Object.keys(answers).length} of {questions.length}
      </p>

      <div className="
        grid grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
        gap-4
        items-start
      ">
        {questions.map(q => {
          const answered = !!answers[q.id];

          return (
            <div
              key={q.id}
              className={`border rounded p-3 bg-white
                ${answered ? "" : "ring-1 ring-blue-200"}
              `}
            >
              <h2 className="text-xs font-semibold mb-2 leading-snug">
                {q.question}
              </h2>

              <div className="space-y-1">
                {q.choices.map(choice => {
                  const isSelected =
                    answers[q.id]?.choiceId === choice.id;

                  return (
                    <button
                      key={choice.id}
                      onClick={() => submitAnswer(q.id, choice.id)}
                      className={`w-full text-left px-2 py-1 text-xs rounded transition
                        ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }
                      `}
                    >
                      {choice.choice.choice}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
