
// const getURLS = (userID) => {
//   let urlsToDisplay = {};
//   for (let urls in urlDatabase) {
//     if (urlDatabase[urls].userID === userID) {
//       urlsToDisplay[urls] = urlDatabase[urls]
      
//     }
//   }
//   return urlsToDisplay;
// };


// function emailExists(email) {
//   for (let user in users) {
//     if (email === users[user].email) {
//       return true
//     }
//   }
//   return false;
// };
function returnID (email, users) {
  let id;
    for (let user in users) {
      if (email === users[user].email) {
        id = users[user].id
          return id;
      }
    }
    return false;
  };

// function generateRandomString() {
//     const tinyString = [...Array(6)].map(() => Math.random().toString(36)[2]).join("")
//     return tinyString;
// }

module.exports = { returnID }; 