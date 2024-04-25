window.addEventListener("load", (event) => {
    const navPoints = document.querySelectorAll(".carousel__navigation-button");
    console.log(navPoints.length);
    navPoints.forEach(point=>{
        point.addEventListener("click", (event) => {
            console.log("click on ",point);
            const current = document.querySelector(".carousel__navigation-button_selected");
            current.classList.remove("carousel__navigation-button_selected");
            point.classList.add("carousel__navigation-button_selected");
        });
    });
});