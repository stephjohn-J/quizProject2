// Retrieve score and username from localStorage
const userData = JSON.parse(localStorage.getItem('quizUserData'))
const resultElement = document.getElementById('result')

// Display the user's name and score
if (userData) {
  resultElement.innerText = `${userData.name}, your score is ${userData.score}`
} else {
  resultElement.innerText = "No quiz results found."
}
