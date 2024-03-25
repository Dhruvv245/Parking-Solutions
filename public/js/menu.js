export const showMenu = (menu)=>{
  menu.addEventListener(`click`, () => {
    const menu = document.querySelector("#page1-content .menu");
    if (menu.classList.contains("active")) {
      menu.classList.remove("active");
      menu.classList.add("inactive");
    } else {
      menu.classList.remove("inactive");
      menu.classList.add("active");
    }
  });
  window.addEventListener("DOMContentLoaded", (event) => {
    const menu = document.querySelector("#page1-content .menu");
    const trigger = document.querySelector("#menu");
  
    trigger.addEventListener("click", () => {
      const rect = trigger.getBoundingClientRect();
      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
  
      let topPosition, leftPosition;
  
      if (rect.bottom + menuHeight + 25 <= windowHeight) {
        topPosition = rect.bottom + 25;
      } else {
        topPosition = rect.top + rect.height + 25;
      }
  
      if (rect.left + menuWidth <= windowWidth) {
        leftPosition = rect.left - 50;
      } else {
        leftPosition = windowWidth - menuWidth - 50;
      }
  
      menu.style.top = `${topPosition}px`;
      menu.style.left = `${leftPosition}px`;
    });
  });
}
