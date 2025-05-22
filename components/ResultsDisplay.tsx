
import React from 'react';
import { QuestionResult } from '../types';
import { CheckIcon, XMarkIcon, AcademicCapIcon } from './icons';

// Nimmt an, dass App.tsx ein Objekt mit allen benötigten deutschen Texten übergibt
interface ResultsDisplayProps {
  scorePercentage: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswersCount: number;
  onRetakeQuiz: () => void;
  results: QuestionResult[];
  onReviewQuestion: (questionIndex: number) => void;
  texts: { // Erwartet ein Objekt mit allen UI-Texten von App.tsx
    resultsTitle: string;
    resultsCongratsPassed: string;
    resultsSorryFailed: string;
    resultsScoreSummary: string;
    resultsFinalScore: string;
    retakeQuizButton: string;
    resultsReviewTitle: string;
    questionLabel: string; // für die Review-Liste
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  scorePercentage,
  passed,
  totalQuestions,
  correctAnswersCount,
  onRetakeQuiz,
  results,
  onReviewQuestion,
  texts,
}) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center w-full max-w-2xl mx-auto">
      <AcademicCapIcon className={`w-16 h-16 mx-auto mb-4 ${passed ? 'text-secondary' : 'text-danger'}`} />
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        {texts.resultsTitle}
      </h2>
      <p className={`text-xl md:text-2xl font-semibold mb-4 ${passed ? 'text-secondary' : 'text-danger'}`}>
        {passed ? texts.resultsCongratsPassed : texts.resultsSorryFailed}
      </p>
      <div className="text-lg mb-2">
        {texts.resultsScoreSummary
            .replace('{correctCount}', correctAnswersCount.toString())
            .replace('{totalQuestions}', totalQuestions.toString())}
      </div>
      <div className="text-3xl md:text-4xl font-bold mb-6">
        {texts.resultsFinalScore} <span className={passed ? 'text-secondary' : 'text-danger'}>{scorePercentage.toFixed(2)}%</span>
      </div>
      
      <button
        onClick={onRetakeQuiz}
        className="bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
      >
        {texts.retakeQuizButton}
      </button>

      <div className="mt-8 text-left">
        <h3 className="text-xl font-semibold mb-4">{texts.resultsReviewTitle}</h3>
        <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {results.map((result, index) => (
            <li 
              key={result.id} 
              onClick={() => onReviewQuestion(index)}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-gray-700 truncate flex-1 mr-2">
                {/* Verwende den generischen deutschen Text von App.tsx */}
                {texts.questionLabel.replace('{current}', (index + 1).toString()).replace('{total}', totalQuestions.toString()).split(':')[0]}: {result.text}
              </span>
              {result.isCorrect ? (
                <CheckIcon className="w-6 h-6 text-secondary" />
              ) : (
                <XMarkIcon className="w-6 h-6 text-danger" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultsDisplay;