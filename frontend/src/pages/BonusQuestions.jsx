import { useEffect, useState } from "react";
import api from "../api/client";
import { useCompetition } from "../context/CompetitionContext";
import { useTranslation } from "react-i18next";

export default function BonusQuestions() {
  const { t } = useTranslation();
  const { selectedCompetition } = useCompetition();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!selectedCompetition) return;
    setLoading(true);
    setError(null);

    try {
      const [questionsRes, answersRes] = await Promise.all([
        api.get(`bonus-questions/?competition=${selectedCompetition}`),
        api.get(`bonus-answers/?competition=${selectedCompetition}`)
      ]);

      const answerMap = {};
      answersRes.data.forEach(ans => {
        answerMap[ans.question] = { answerId: ans.id, choiceId: ans.answer };
      });

      setQuestions(questionsRes.data);
      setAnswers(answerMap);
    } catch (err) {
      setError(t("bonus.submitError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuestions([]);
    setAnswers({});
    setError(null);
    load();
  }, [selectedCompetition]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const submitAnswer = async (questionId, choiceId) => {
    setError(null);
    try {
      const existing = answers[questionId];
      let res;
      if (existing) {
        res = await api.patch(`bonus-answers/${existing.answerId}/`, {
          answer: choiceId
        });
      } else {
        res = await api.post("bonus-answers/", {
          question: questionId,
          answer: choiceId
        });
      }

      setAnswers(prev => ({
        ...prev,
        [questionId]: { answerId: res.data.id, choiceId }
      }));
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response?.data?.detail || t("bonus.forbidden"));
      } else {
        setError(t("bonus.submitError"));
      }
    }
  };

  if (!selectedCompetition) {
    return (
      <div className="text-center mt-10 text-gray-500">
        {t("bonus.selectCompetition")}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">{t("bonus.loading")}</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 mt-6">
      <h1 className="text-2xl font-bold mb-1">{t("bonus.title")}</h1>

      <p className="text-sm text-gray-500 mb-3">
        {t("bonus.answeredOf", { answered: Object.keys(answers).length, total: questions.length })}
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
        {questions.map(q => {
          const answered = !!answers[q.id];
          return (
            <div
              key={q.id}
              className={`border rounded p-3 bg-white ${
                answered ? "" : "ring-1 ring-blue-200"
              }`}
            >
              <h2 className="text-xs font-semibold mb-2 leading-snug">{q.question}</h2>

              <div className="space-y-1">
                {q.choices.map(choice => {
                  const isSelected = answers[q.id]?.choiceId === choice.id;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => submitAnswer(q.id, choice.id)}
                      className={`w-full text-left px-2 py-1 text-xs rounded transition
                        ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
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
