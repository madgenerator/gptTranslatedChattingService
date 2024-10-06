const userID = document.getElementById("userID");
const profileNum = document.getElementById("profileNum");
profileNum.addEventListener("change", setProfile);

function setProfile(){
    const selectedValue = profileNum.value;
    console.log("Profile Changed: " + selectedValue);
}

function startChat(){
  console.log("Enter button clicked");
  if(userID.value == "" || profileNum.value == ""){
    alert("ID or Profile Num cannot be blank.")
  }
  else
  {
    localStorage.setItem("userID", userID.value); //user ID to local Storage

    //if random, set random profile image from 1 to 6
    if(profileNum.value == "random"){
      const randomNum = Math.floor(Math.random()*6)+1; //Math.random() -> 0 ~ 1 -> 0 ~ 5.0 -> 1 ~ 6
      localStorage.setItem("profileNum", randomNum);
    }
    else
    {
      localStorage.setItem("profileNum", profileNum.value); //set profileNum to Local Storage
    }

    window.location.href = "Chat.html";
  }
}