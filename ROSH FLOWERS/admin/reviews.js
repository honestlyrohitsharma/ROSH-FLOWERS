import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


const reviewList = document.getElementById("reviewList");
const addBtn = document.getElementById("addReviewBtn");
const nameInput = document.getElementById("customerName");
const quoteInput = document.getElementById("quote");


async function loadReviews() {
  const { data, error } = await supabase.from("review").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return;
  }

  reviewList.innerHTML = "";
  data.forEach((review) => {
    const div = document.createElement("div");
    div.classList.add("review-card");
    div.innerHTML = `
      <h3>${review.customer_name}</h3>
      <p>"${review.quote}"</p>
      <small>${new Date(review.created_at).toLocaleString()}</small>
      <br />
      <button class="delete-btn" data-id="${review.id}">Delete</button>
    `;
    reviewList.appendChild(div);
  });


  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await supabase.from("review").delete().eq("id", id);
      loadReviews();
    });
  });
}


addBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const quote = quoteInput.value.trim();

  if (!name || !quote) {
    alert("Please fill all fields.");
    return;
  }

  const { error } = await supabase.from("review").insert([{ customer_name: name, quote }]);
  if (error) {
    console.error(error);
    alert("Failed to add review.");
  } else {
    nameInput.value = "";
    quoteInput.value = "";
    loadReviews();
  }
});

loadReviews();

