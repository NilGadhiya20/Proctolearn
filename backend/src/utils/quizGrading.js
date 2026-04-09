const OBJECTIVE_QUESTION_TYPES = new Set(['mcq', 'multiple_choice', 'true_false', 'multiple_select']);

const toComparableString = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

const toNumberIfNumeric = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }

  return null;
};

const resolveAnswerText = (question, answer) => {
  if (answer === null || answer === undefined || answer === '') {
    return null;
  }

  const numeric = toNumberIfNumeric(answer);
  if (numeric !== null && Array.isArray(question?.options)) {
    return question.options[numeric]?.text ?? null;
  }

  return String(answer);
};

const getCorrectOptionValues = (question) => {
  if (!Array.isArray(question?.options)) {
    return [];
  }

  return question.options
    .map((option, index) => ({
      index,
      text: option?.text ?? '',
      isCorrect: Boolean(option?.isCorrect)
    }))
    .filter((option) => option.isCorrect);
};

const getExpectedAnswer = (question) => {
  if (question?.correctAnswer !== undefined && question?.correctAnswer !== null && question?.correctAnswer !== '') {
    return question.correctAnswer;
  }

  const correctOptions = getCorrectOptionValues(question);
  if (correctOptions.length === 0) {
    return null;
  }

  if (question?.questionType === 'multiple_select') {
    return correctOptions.map((option) => option.text);
  }

  return correctOptions[0]?.text ?? null;
};

const normalizeProvidedAnswer = (answer) => {
  if (Array.isArray(answer)) {
    return answer.map((item) => normalizeProvidedAnswer(item)).flat();
  }

  if (answer && typeof answer === 'object') {
    if (Object.prototype.hasOwnProperty.call(answer, 'selectedOption')) {
      return normalizeProvidedAnswer(answer.selectedOption);
    }

    if (Object.prototype.hasOwnProperty.call(answer, 'selectedOptions')) {
      return normalizeProvidedAnswer(answer.selectedOptions);
    }

    if (Object.prototype.hasOwnProperty.call(answer, 'answer')) {
      return normalizeProvidedAnswer(answer.answer);
    }

    if (Object.prototype.hasOwnProperty.call(answer, 'value')) {
      return normalizeProvidedAnswer(answer.value);
    }
  }

  const numeric = toNumberIfNumeric(answer);
  if (numeric !== null) {
    return numeric;
  }

  return answer;
};

const toAnswerArray = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => toAnswerArray(item));
  }

  if (value === null || value === undefined || value === '') {
    return [];
  }

  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [value];
};

const compareSingleAnswer = (question, providedAnswer, expectedAnswer) => {
  const providedText = resolveAnswerText(question, providedAnswer);
  const expectedText = resolveAnswerText(question, expectedAnswer);

  if (providedText === null || expectedText === null) {
    return false;
  }

  return toComparableString(providedText) === toComparableString(expectedText);
};

const compareMultipleAnswers = (question, providedAnswer, expectedAnswer) => {
  const providedValues = toAnswerArray(providedAnswer);
  const expectedValues = toAnswerArray(expectedAnswer);

  const providedNormalized = providedValues
    .map((value) => resolveAnswerText(question, value))
    .filter(Boolean)
    .map((value) => toComparableString(value))
    .sort();

  const expectedNormalized = expectedValues
    .map((value) => resolveAnswerText(question, value))
    .filter(Boolean)
    .map((value) => toComparableString(value))
    .sort();

  if (providedNormalized.length === 0 || expectedNormalized.length === 0) {
    return false;
  }

  return providedNormalized.length === expectedNormalized.length
    && providedNormalized.every((value, index) => value === expectedNormalized[index]);
};

export const canAutoGradeQuestion = (question) => {
  if (!question) {
    return false;
  }

  if (OBJECTIVE_QUESTION_TYPES.has(question.questionType)) {
    return true;
  }

  return Boolean(question.correctAnswer !== undefined && question.correctAnswer !== null && question.correctAnswer !== '');
};

export const gradeQuestion = (question, rawAnswer) => {
  const marksAllotted = Number(question?.marks) || 0;
  const providedAnswer = normalizeProvidedAnswer(rawAnswer);
  const expectedAnswer = getExpectedAnswer(question);
  const autoGradable = canAutoGradeQuestion(question);

  if (!autoGradable) {
    return {
      questionId: question?._id,
      answer: rawAnswer ?? null,
      selectedOptions: Array.isArray(providedAnswer)
        ? providedAnswer
        : providedAnswer !== null && providedAnswer !== undefined
          ? [String(providedAnswer)]
          : [],
      isCorrect: false,
      marksObtained: 0,
      marksAllotted,
      requiresManualReview: true
    };
  }

  const isCorrect = question?.questionType === 'multiple_select'
    ? compareMultipleAnswers(question, providedAnswer, expectedAnswer)
    : compareSingleAnswer(question, providedAnswer, expectedAnswer);

  const selectedOptions = Array.isArray(providedAnswer)
    ? providedAnswer.map((value) => resolveAnswerText(question, value)).filter(Boolean)
    : [resolveAnswerText(question, providedAnswer)].filter(Boolean);

  return {
    questionId: question?._id,
    answer: rawAnswer ?? null,
    selectedOptions,
    isCorrect,
    marksObtained: isCorrect ? marksAllotted : 0,
    marksAllotted,
    requiresManualReview: false
  };
};

export const gradeQuizAttempt = ({ questions = [], answers = [], passingMarks = 0, quiz = {} }) => {
  const answerMap = new Map();

  for (const entry of answers) {
    const questionId = entry?.questionId || entry?.question || entry?._id;
    if (!questionId) {
      continue;
    }

    answerMap.set(String(questionId), entry);
  }

  const gradedAnswers = [];
  let totalMarks = 0;
  let obtainedMarks = 0;
  let requiresManualReview = false;

  for (const question of questions) {
    const marksAllotted = Number(question?.marks) || 0;
    totalMarks += marksAllotted;

    const storedAnswer = answerMap.get(String(question._id));
    const rawAnswer = storedAnswer?.answer ?? storedAnswer?.selectedOption ?? storedAnswer?.selectedOptions ?? storedAnswer?.value ?? storedAnswer ?? null;
    const graded = gradeQuestion(question, rawAnswer);

    requiresManualReview = requiresManualReview || Boolean(graded.requiresManualReview);
    obtainedMarks += Number(graded.marksObtained) || 0;

    gradedAnswers.push({
      questionId: question._id,
      answer: rawAnswer,
      selectedOptions: graded.selectedOptions,
      attemptTime: storedAnswer?.attemptTime || storedAnswer?.answeredAt || new Date(),
      timeSpent: storedAnswer?.timeSpent || 0,
      isCorrect: graded.isCorrect,
      marksObtained: graded.marksObtained,
      marksAllotted: graded.marksAllotted
    });
  }

  const percentage = totalMarks > 0 ? Math.max(0, Math.min(100, (obtainedMarks / totalMarks) * 100)) : 0;
  const isPassed = obtainedMarks >= Number(passingMarks || quiz?.passingMarks || 0);

  const grade = percentage >= 90 ? 'A+'
    : percentage >= 80 ? 'A'
    : percentage >= 70 ? 'B'
    : percentage >= 60 ? 'C'
    : percentage >= 50 ? 'D'
    : 'F';

  return {
    answers: gradedAnswers,
    totalMarks,
    obtainedMarks,
    percentage,
    isPassed,
    grade,
    status: requiresManualReview ? 'submitted' : 'graded',
    requiresManualReview
  };
};