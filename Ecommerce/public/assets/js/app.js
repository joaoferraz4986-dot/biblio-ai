document.querySelectorAll("form").forEach(function (form) {
  form.addEventListener("submit", function () {
    var button = form.querySelector('button[type="submit"]');
    if (button && button.dataset.busy !== "1") {
      button.dataset.busy = "1";
      button.style.opacity = ".6";
    }
  });
});
