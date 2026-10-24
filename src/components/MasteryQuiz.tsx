import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../constants';
import { CheckCircle2, XCircle, Award, ArrowRight, RotateCcw } from 'lucide-react';

export const MasteryQuiz: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const question = QUIZ_QUESTIONS[currentIdx];
  const selectedOptionId = selectedAnswers[question.id];
  const isQuestionSubmitted = submitted[question.id];

  const handleSelectOption = (optionId: string) => {
    if (isQuestionSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [question.id]: optionId,
    }));
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId) return;
    setSubmitted((prev) => ({
      ...prev,
      [question.id]: true,
    }));
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted({});
    setCurrentIdx(0);
  };

  // Calculate score
  const totalQuestions = QUIZ_QUESTIONS.length;
  const answeredCount = Object.keys(submitted).length;
  let correctCount = 0;
  QUIZ_QUESTIONS.forEach((q) => {
    if (submitted[q.id]) {
      const selectedId = selectedAnswers[q.id];
      const opt = q.options.find((o) => o.id === selectedId);
      if (opt?.isCorrect) correctCount++;
    }
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header & Score Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span>Laboratorio de Desafíos & Evaluación de Maestría</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pon a prueba tu razonamiento analítico con casos de examen de posgrado y decisiones metodológicas reales.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
            Aciertos: <strong className="text-emerald-400">{correctCount}</strong> / {totalQuestions}
          </div>
          <button
            onClick={handleResetQuiz}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Reiniciar Evaluación"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {QUIZ_QUESTIONS.map((q, idx) => {
          const isDone = submitted[q.id];
          const isCurrent = currentIdx === idx;
          const chosenOpt = q.options.find((o) => o.id === selectedAnswers[q.id]);
          const isCorrect = chosenOpt?.isCorrect;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : isDone
                  ? isCorrect
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>Caso {idx + 1}</span>
              {isDone && (
                isCorrect ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Question Body */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            {question.contextBadge}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Pregunta {currentIdx + 1} de {totalQuestions}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white">
          {question.title}
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80">
          {question.scenario}
        </p>

        {/* Small Matrix Display of the scenario */}
        <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-sans">Datos del escenario:</span>
          <div className="flex gap-4">
            <span className="text-emerald-400">TP: {question.matrix.tp}</span>
            <span className="text-amber-400">FP: {question.matrix.fp}</span>
            <span className="text-rose-400">FN: {question.matrix.fn}</span>
            <span className="text-cyan-400">TN: {question.matrix.tn}</span>
          </div>
        </div>

        <div className="text-sm font-semibold text-slate-200 pt-1">
          {question.question}
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let optionStyle = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700';

            if (isQuestionSubmitted) {
              if (opt.isCorrect) {
                optionStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200';
              } else if (isSelected && !opt.isCorrect) {
                optionStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
              } else {
                optionStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500';
              }
            } else if (isSelected) {
              optionStyle = 'bg-indigo-950/50 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500/40';
            }

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${optionStyle}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isQuestionSubmitted ? (
                      opt.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isSelected ? (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                      )
                    ) : (
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium leading-relaxed block">
                      {opt.text}
                    </span>
                    {isQuestionSubmitted && isSelected && (
                      <p className={`text-xs mt-1.5 pt-1.5 border-t ${
                        opt.isCorrect ? 'border-emerald-800/60 text-emerald-300' : 'border-rose-800/60 text-rose-300'
                      }`}>
                        {opt.explanation}
                      </p>
                    )}
                    {isQuestionSubmitted && !isSelected && opt.isCorrect && (
                      <p className="text-xs mt-1.5 pt-1.5 border-t border-emerald-800/60 text-emerald-300">
                        {opt.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
          >
            ← Caso Anterior
          </button>

          {!isQuestionSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOptionId}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg transition-colors shadow-sm"
            >
              Validar Respuesta
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentIdx === totalQuestions - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg transition-colors shadow-sm"
            >
              <span>Siguiente Caso</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
