const checkboxs = document.querySelectorAll(".check");
const texts = document.querySelectorAll(".text");

checkboxs.forEach((box, index) => {  // ✅ parentheses added
   box.addEventListener("change", function () {
        if(box.checked){
            texts[index].style.textDecoration = "line-through";
            box.closest("form").submit();
        } else {
            texts[index].style.textDecoration = "none";
        }
   });  // ✅ also fixed closing bracket was outside
});
