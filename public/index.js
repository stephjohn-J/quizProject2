const startButton = document.getElementById('start-btn')
const nextButton = document.getElementById('next-btn')
const questionContainerElement = document.getElementById('question-container')
const questionElement = document.getElementById('question')
const answerButtonsElement = document.getElementById('answer-buttons')
const nameFormContainer = document.getElementById('name-form-container')
const submitNameButton = document.getElementById('submit-name-btn')
const viewScoreButton = document.getElementById('view-score-btn')
const nameInput = document.getElementById('name')
const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');
correctSound.volume = 0.5; // 50% volume
wrongSound.volume = 0.5;   // 50% volume


let shuffledQuestions, currentQuestionIndex, score = 0, userName = ''

// Event listener to capture the user's name and start the quiz
submitNameButton.addEventListener('click', () => {
  userName = nameInput.value
  if (userName) {
    nameFormContainer.classList.add('hide') // Hide name input form
    startButton.classList.remove('hide') // Show start button after name is entered
  } else {
    alert("Please enter your name to start the quiz!") // Alert if no name is entered
  }
})

// Start quiz event listener
startButton.addEventListener('click', startGame)

// Next question event listener
nextButton.addEventListener('click', () => {
  currentQuestionIndex++
  setNextQuestion()
})

// Function to start the quiz
async function startGame() {
  score = 0 // Reset score at the start of each game
  startButton.classList.add('hide')

  try {
    const res = await fetch('questions.json'); // Fetching questions from the JSON file
    const allQuestions = await res.json();

    // Shuffle questions and select the first 10
    shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 20);
    currentQuestionIndex = 0
    questionContainerElement.classList.remove('hide')
    setNextQuestion()
  } catch (error) {
    console.error('Error fetching questions:', error);
    alert('Failed to load questions.');
  }
}

// Function to set the next question
function setNextQuestion() {
  resetState()
  showQuestion(shuffledQuestions[currentQuestionIndex])
}

// Function to display the question and its answers (shuffled)
function showQuestion(question) {
  questionElement.innerText = question.question
  
  // Shuffle the answers before displaying them
  const shuffledAnswers = question.answers.sort(() => Math.random() - 0.5);
  
  shuffledAnswers.forEach(answer => {
    const button = document.createElement('button')
    button.innerText = answer.text
    button.classList.add('btn')
    if (answer.correct) {
      button.dataset.correct = answer.correct
    }
    button.addEventListener('click', selectAnswer)
    answerButtonsElement.appendChild(button)
  })
}

// Function to reset state between questions
function resetState() {
  clearStatusClass(document.body)
  nextButton.classList.add('hide')
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild)
  }
}

// Function to handle answer selection
function selectAnswer(e) {
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct === "true"; // Ensure it's a boolean
  const currentQuestion = shuffledQuestions[currentQuestionIndex]; // Get current question

  setStatusClass(document.body, correct);
  Array.from(answerButtonsElement.children).forEach(button => {
    setStatusClass(button, button.dataset.correct === "true");
  });

  // If correct answer, increase the score and play correct sound
  if (correct) {
    score++;
    playCorrectSound();
  } else {
    // If wrong, play wrong sound and show explanation
    playWrongSound();
    displayExplanation(currentQuestion.explanation); // Display explanation for wrong answers
  }

  // Show next button after sound has finished playing
  const soundDuration = correct ? correctSound.duration * 1000 : wrongSound.duration * 1000;
  setTimeout(() => {
    if (shuffledQuestions.length > currentQuestionIndex + 1) {
      nextButton.classList.remove('hide');
    } else {
      saveScore();
      startButton.innerText = 'Restart';
      startButton.classList.remove('hide');
      viewScoreButton.classList.remove('hide');
    }
  }, soundDuration); // Delay showing "Next" button until sound finishes
}

// Function to display explanation
function displayExplanation(explanation) {
  // Create an explanation element or use a modal
  const explanationElement = document.createElement('div');
  explanationElement.innerText = explanation;
  explanationElement.classList.add('explanation');
  document.body.appendChild(explanationElement);

  // Optionally hide the explanation after a certain amount of time or user interaction
  setTimeout(() => {
    explanationElement.remove(); // Remove after a few seconds
  }, 10000); 
}

// Function to play correct sound
function playCorrectSound() {
  correctSound.play();
}

// Function to play wrong sound
function playWrongSound() {
  wrongSound.play();
}

// Function to save score and username to localStorage
async function saveScore() {
  const userData = {
    name: userName,
    score: score
  };

  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData), 
    };
    const response = await fetch("/api", options); 
    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error("Error saving data:", error);
  }

  localStorage.setItem('quizUserData', JSON.stringify(userData)); // Save as JSON
}

// Function to set the correct/wrong class
function setStatusClass(element, correct) {
  clearStatusClass(element)
  if (correct) {
    element.classList.add('correct')
  } else {
    element.classList.add('wrong')
  }
}

// Function to clear the correct/wrong class
function clearStatusClass(element) {
  element.classList.remove('correct')
  element.classList.remove('wrong')
}

// Event listener for viewing the score on a separate page
viewScoreButton.addEventListener('click', () => {
  window.location.href = 'score.html' // Redirect to score page
})
