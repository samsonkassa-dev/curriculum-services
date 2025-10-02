import { useState, useEffect } from "react";
import { clsx } from "clsx";
import type { AssessmentQuestion, AssessmentAnswer } from "@/lib/hooks/useAssessmentLink";

interface QuestionCardProps {
  question: AssessmentQuestion;
  value?: AssessmentAnswer;
  onChange: (_assessmentAnswer: AssessmentAnswer) => void;
  disabled?: boolean;
}

export function QuestionCard({ question, value, onChange, disabled = false }: QuestionCardProps) {
  const [selectedChoices, setSelectedChoices] = useState<string[]>(
    value?.selectedChoiceIds || []
  );
  const [textAnswer, setTextAnswer] = useState<string>(value?.textAnswer || "");

  // Update local state when value prop changes (e.g., when answers are restored)
  useEffect(() => {
    if (value?.selectedChoiceIds !== undefined) {
      console.log('QuestionCard: Updating from props', {
        questionId: question.id,
        questionType: question.questionType,
        newSelectedChoiceIds: value.selectedChoiceIds,
        currentSelectedChoices: selectedChoices
      });
      setSelectedChoices(value.selectedChoiceIds);
    }
    if (value?.textAnswer !== undefined) {
      setTextAnswer(value.textAnswer);
    }
  }, [value, question.id, question.questionType, selectedChoices]);

  const handleChoiceSelect = (choiceId: string) => {
    if (disabled) return;
    
    let newSelection: string[];
    
    if (question.questionType === "RADIO") {
      newSelection = [choiceId];
    } else if (question.questionType === "CHECKBOX") {
      // Toggle: if already selected, remove it; otherwise add it
      const currentlySelected = selectedChoices.includes(choiceId);
      newSelection = currentlySelected
        ? selectedChoices.filter(id => id !== choiceId)
        : [...selectedChoices, choiceId];
      
      console.log('CHECKBOX toggle:', {
        choiceId,
        currentlySelected,
        before: selectedChoices,
        after: newSelection
      });
    } else {
      return; // For TEXT type, use text input instead
    }

    setSelectedChoices(newSelection);
    onChange({
      assessmentEntryId: question.id,
      selectedChoiceIds: newSelection,
      textAnswer: undefined
    });
  };

  const handleTextChange = (text: string) => {
    if (disabled) return;
    
    setTextAnswer(text);
    onChange({
      assessmentEntryId: question.id,
      selectedChoiceIds: [], // Backend expects empty array for TEXT questions
      textAnswer: text || undefined // Don't send empty string
    });
  };

  const getPoints = () => {
    return question.weight > 0 ? `${question.weight} Point${question.weight > 1 ? 's' : ''}` : '';
  };

  return (
    <div className="w-full mb-8">
      {/* Exam Paper Question Header */}
      <div className="mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-muted-foreground/20 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {question.questionType === "RADIO" ? "Choose ONE correct answer" : 
             question.questionType === "CHECKBOX" ? "Choose ALL correct answers" : "Write your answer below"}
          </div>
          {getPoints() && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Marks</div>
              <div className="text-base font-bold text-primary/80">[{question.weight}]</div>
            </div>
          )}
        </div>
        
        {/* Question Text */}
        <div className="border-t border-muted-foreground/10 pt-3">
          <h4 className="text-lg font-medium text-foreground mb-3 break-words whitespace-pre-wrap leading-relaxed">
            {question.question}
          </h4>
          
          {/* Question Image */}
          {question.questionImageUrl && (
            <div className="mb-4">
              <img
                src={question.questionImageUrl}
                alt="Question illustration"
                className="w-40 h-28 object-cover rounded-lg border border-muted-foreground/20"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      {/* Answer Section */}
      <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-muted-foreground/20">
        <div className="space-y-3">
          {question.questionType === "TEXT" ? (
            <div className="space-y-3">
              <h4 className="text-base font-medium text-foreground">Your Answer:</h4>
              <textarea
                value={textAnswer}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type your detailed answer here..."
                disabled={disabled}
                className={clsx(
                  "w-full min-h-[100px] p-3 rounded-lg border-2 text-sm focus:outline-none focus:ring-0 resize-y transition-colors",
                  disabled 
                    ? "bg-muted border-muted cursor-not-allowed text-muted-foreground" 
                    : "bg-white border-border focus:border-primary/60"
                )}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-base font-medium text-foreground">Options:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.choices.map((choice, choiceIndex) => {
                  const isSelected = selectedChoices.includes(choice.id);
                  const inputType = question.questionType === "RADIO" ? "radio" : "checkbox";
                  
                  return (
                    <div
                      key={choice.id}
                      className={clsx(
                        "flex items-start gap-2.5 p-3 rounded-lg transition-all duration-200 min-h-[50px]",
                        disabled 
                          ? "cursor-not-allowed bg-muted/50" 
                          : "cursor-pointer bg-white/80",
                        !disabled && {
                          "ring-1 ring-primary/40 bg-primary/5": isSelected,
                          "hover:bg-primary/5 border border-muted-foreground/20": !isSelected,
                        },
                        disabled && {
                          "bg-muted/30": isSelected,
                          "border border-muted-foreground/10": !isSelected,
                        }
                      )}
                      onClick={() => !disabled && handleChoiceSelect(choice.id)}
                    >
                      {/* Choice Indicator */}
                      <div className={clsx(
                        "w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5",
                        question.questionType === "RADIO" ? "rounded-full" : "rounded",
                        disabled 
                          ? {
                              "border-muted-foreground/30 bg-muted-foreground/30": isSelected,
                              "border-muted-foreground/20 bg-muted": !isSelected,
                            }
                          : {
                              "border-primary/70 bg-primary/70": isSelected,
                              "border-muted-foreground/40 bg-white": !isSelected,
                            }
                      )}>
                        {isSelected && (
                          <div className={clsx(
                            "bg-white",
                            question.questionType === "RADIO" 
                              ? "w-2 h-2 rounded-full" 
                              : "w-2 h-2 rounded-sm"
                          )} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Choice Image */}
                        {choice.choiceImageUrl && (
                          <div className="mb-2">
                            <img
                              src={choice.choiceImageUrl}
                              alt={`Choice ${choiceIndex + 1} image`}
                              className="w-16 h-12 object-cover rounded border border-muted-foreground/20"
                              loading="lazy"
                            />
                          </div>
                        )}
                        
                        {/* Choice Text */}
                        <span className={clsx(
                          "text-sm break-words whitespace-pre-wrap leading-relaxed block",
                          disabled 
                            ? "text-muted-foreground/70"
                            : isSelected 
                            ? "font-medium text-primary/90" 
                            : "text-foreground"
                        )}>
                          {choice.choiceText || `Choice ${choiceIndex + 1}`}
                        </span>
                      </div>
                      
                      {/* Hidden input for form handling */}
                      <input
                        type={inputType}
                        name={`question-${question.id}`}
                        value={choice.id}
                        checked={isSelected}
                        onChange={() => {}} // Handled by onClick above
                        className="sr-only"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
