// Cover click → open book (source: App().handleOpen)
document.getElementById("cover-click-target").addEventListener("click", function () {
  document.getElementById("cover-scene").classList.add("hidden");
  var book = document.getElementById("book");
  book.style.display = "block";
  book.classList.add("is-open");
  setTimeout(function () {
    document.getElementById("book").scrollIntoView({ behavior: "smooth" });
  }, 400);
});

// Logo mark click → close book, return to the cover (first page)
document.getElementById("logo-home-button").addEventListener("click", function () {
  var book = document.getElementById("book");
  book.classList.remove("is-open");
  book.style.display = "none";
  document.getElementById("cover-scene").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});
