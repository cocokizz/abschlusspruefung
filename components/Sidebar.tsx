
import React from 'react';
import { Question } from '../types';
import { CheckIcon, XMarkIcon } from './icons';

interface SidebarProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, string[]>;
  quizSubmitted: boolean;
  onQuestionSelect: (index: number) => void;
  getQuestionStatus: (questionId: string, userSelectedAnswers: string[]) => 'correct' | 'incorrect' | 'unanswered' | 'answered';
  sidebarTitle: string;
  answeredTooltip: string;
  unansweredTooltip: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    questions, 
    currentQuestionIndex, 
    userAnswers, 
    quizSubmitted, 
    onQuestionSelect,
    getQuestionStatus,
    sidebarTitle,
    answeredTooltip,
    unansweredTooltip
}) => {
  return (
    <aside className="w-full md:w-72 bg-darkgray text-white p-4 space-y-2 overflow-y-auto h-full">
      <h2 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">{sidebarTitle}</h2>
      <nav>
        <ul>
          {questions.map((question, index) => {
            const userAnswer = userAnswers[question.id] || [];
            const status = quizSubmitted 
                           ? getQuestionStatus(question.id, userAnswer) 
                           : (userAnswer.length > 0 ? 'answered' : 'unanswered');
            
            let statusIcon = null;
            let currentTooltipText = "";

            if (quizSubmitted) {
              if (status === 'correct') {
                statusIcon = <CheckIcon className="w-5 h-5 text-secondary" />;
                currentTooltipText = "Korrekt"; 
              } else if (status === 'incorrect') {
                statusIcon = <XMarkIcon className="w-5 h-5 text-danger" />;
                currentTooltipText = "Inkorrekt"; 
              }
            } else if (status === 'answered') {
                 statusIcon = <div className="w-3 h-3 bg-blue-400 rounded-full"></div>;
                 currentTooltipText = answeredTooltip;
            } else { // unanswered
                 statusIcon = <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div>;
                 currentTooltipText = unansweredTooltip;
            }

            const ariaLabelText = `Frage ${index + 1}, Status: ${currentTooltipText}`;

            return (
              <li key={question.id}>
                <button
                  onClick={() => onQuestionSelect(index)}
                  className={`w-full text-left px-3 py-2.5 rounded-md flex justify-between items-center transition-colors
                    ${index === currentQuestionIndex ? 'bg-primary text-white' : 'hover:bg-gray-700 text-gray-300'}
                  `}
                  title={currentTooltipText}
                  aria-label={ariaLabelText}
                >
                  <span className="truncate">{`Frage ${index + 1}`}</span>
                  {statusIcon}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;