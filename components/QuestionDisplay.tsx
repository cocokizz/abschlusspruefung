
import React from 'react';
import { Question, AnswerOption, QuestionType, QuizStatus } from '../types';
import { CheckIcon, XMarkIcon } from './icons';
import SpeechControls from './SpeechControls';

interface QuestionDisplayProps {
  question: Question;
  userSelectedAnswers: string[];
  onAnswerSelect: (optionId: string) => void;
  questionStatus?: 'correct' | 'incorrect' | 'unanswered' | 'answered';
  quizStatus: QuizStatus;
  questionNumber: number;
  totalQuestions: number;
  questionLabel: string; // z.B. "Frage {current} von {total}"
  explanationLabel: string; // z.B. "Erläuterung:"
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  userSelectedAnswers,
  onAnswerSelect,
  quizStatus,
  questionNumber,
  totalQuestions,
  questionLabel,
  explanationLabel,
}) => {
  const isSubmitted = quizStatus === QuizStatus.SUBMITTED || quizStatus === QuizStatus.TIME_UP;

  const getOptionClasses = (option: AnswerOption) => {
    let classes = 'p-3 border rounded-lg cursor-pointer transition-all flex items-center text-left w-full text-black ';
    const isSelected = userSelectedAnswers.includes(option.id);
    const isCorrect = question.correctAnswers.includes(option.id);

    if (isSubmitted) {
      classes += ' cursor-default';
      if (isSelected && isCorrect) {
        classes += ' bg-green-100 border-green-500';
      } else if (isSelected && !isCorrect) {
        classes += ' bg-red-100 border-red-500';
      } else if (isCorrect) {
        classes += ' bg-green-50 border-green-300'; 
      } else {
        classes += ' bg-gray-100 border-gray-300';
      }
    } else {
      if (isSelected) {
        classes += ' bg-blue-100 border-primary';
      } else {
        classes += ' bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400';
      }
    }
    return classes;
  };
  
  const textToRead = `${question.text}. Optionen: ${question.options.map(opt => opt.text).join('. ')}.`;

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full">
      <div className="mb-2 text-sm text-gray-500">
        {questionLabel.replace('{current}', questionNumber.toString()).replace('{total}', totalQuestions.toString())}
      </div>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">{question.text}</h2>
      
      <div className="space-y-3">
        {question.options.map((option) => (
          <label key={option.id} htmlFor={option.id} className={getOptionClasses(option)}>
            <input
              type={question.type === QuestionType.SINGLE_CHOICE ? 'radio' : 'checkbox'}
              id={option.id}
              name={question.id}
              value={option.id}
              checked={userSelectedAnswers.includes(option.id)}
              onChange={() => onAnswerSelect(option.id)}
              disabled={isSubmitted}
              className="mr-3 h-5 w-5 text-primary focus:ring-primary border-gray-300 disabled:opacity-70"
            />
            <span className="flex-1">{option.text}</span> 
            {isSubmitted && question.correctAnswers.includes(option.id) && <CheckIcon className="w-5 h-5 text-green-600 ml-2" />}
            {isSubmitted && userSelectedAnswers.includes(option.id) && !question.correctAnswers.includes(option.id) && <XMarkIcon className="w-5 h-5 text-red-600 ml-2" />}
          </label>
        ))}
      </div>

      {isSubmitted && question.explanation && (
        <div className={`mt-6 p-3 rounded-md text-sm ${question.correctAnswers.some(ca => userSelectedAnswers.includes(ca)) && userSelectedAnswers.length === question.correctAnswers.length ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <h4 className="font-semibold mb-1">{explanationLabel}</h4>
          <p>{question.explanation}</p>
        </div>
      )}
      
      <SpeechControls textToRead={textToRead} />

    </div>
  );
};

export default QuestionDisplay;