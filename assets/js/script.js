let orders = JSON.parse(localStorage.getItem("skOnlineOrders")) || [];

// এখানে তোমার WhatsApp নম্বর দাও
const whatsappNumber = "919800334603";

function getPrice(product) {
  if (product === "Full Boiled Egg") return 8;
  if (product === "Half Boiled Egg") return 10;
  if (product === "Brown Bread") return 35;
  if (product === "Jam") return 120;
  if (product === "Butter") return 60;
  if (product === "Services") return 0;
  return 0;
}

function handleProductChange() {
  const product = document.getElementById("product").value;
  const commentBox = document.getElementById("serviceCommentBox");

  if (product === "Services") {
    commentBox.classList.remove("hidden");
  } else {
    commentBox.classList.add("hidden");
    document.getElementById("comment").value = "";
  }

  updatePriceAndTotal();
}

function updatePriceAndTotal() {
  const product = document.getElementById("product").value;
  const qty = parseInt(document.getElementById("qty").value) || 0;
  const price = getPrice(product);
  const total = price * qty;

  document.getElementById("price").value = price > 0 ? price : "";
  document.getElementById("total").innerText = total;
}

function handlePhoneInput() {
  const phoneInput = document.getElementById("customerWhatsapp");
  let value = phoneInput.value.replace(/\D/g, "");

  if (!value.startsWith("91")) {
    value = "91" + value.replace(/^91/, "");
  }

  if (value.length < 2) {
    value = "91";
  }

  phoneInput.value = value.substring(0, 12);
}

function placeOrder() {
  const date = document.getElementById("date").value;
  const product = document.getElementById("product").value;
  const name = document.getElementById("name").value.trim();
  const customerWhatsapp = document.getElementById("customerWhatsapp").value.trim();
  const qty = parseInt(document.getElementById("qty").value) || 0;
  const price = getPrice(product);
  const total = price * qty;
  const comment = document.getElementById("comment").value.trim();

  if (!date) {
    alert("Please select a date.");
    return;
  }

  if (!product) {
    alert("Please select a product or service.");
    return;
  }

  if (!name) {
    alert("Please enter customer name.");
    return;
  }

  if (!customerWhatsapp || customerWhatsapp.length !== 12 || !customerWhatsapp.startsWith("91")) {
    alert("Please enter a valid customer WhatsApp number.");
    return;
  }

  if (product !== "Services" && qty <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }

  if (product === "Services" && !comment) {
    alert("Please write your service requirement in comment box.");
    return;
  }

  const order = {
    id: Date.now(),
    date,
    product,
    name,
    customerWhatsapp,
    qty: product === "Services" ? "-" : qty,
    price: product === "Services" ? "-" : price,
    total: product === "Services" ? "-" : total,
    comment: comment || "-",
    status: "Pending"
  };

  orders.push(order);
  saveOrders();
  renderOrders();

  sendOrderToWhatsApp(order);

  resetForm();
}

function sendOrderToWhatsApp(order) {
  let message = "";

  if (order.product === "Services") {
    message =
      "New Service Order%0A" +
      "Date: " + order.date + "%0A" +
      "Name: " + order.name + "%0A" +
      "Customer WhatsApp: " + order.customerWhatsapp + "%0A" +
      "Service: " + order.product + "%0A" +
      "Comment: " + order.comment + "%0A" +
      "Status: " + order.status;
  } else {
    message =
      "New Product Order%0A" +
      "Date: " + order.date + "%0A" +
      "Name: " + order.name + "%0A" +
      "Customer WhatsApp: " + order.customerWhatsapp + "%0A" +
      "Item: " + order.product + "%0A" +
      "Quantity: " + order.qty + "%0A" +
      "Price: ₹" + order.price + "%0A" +
      "Total: ₹" + order.total + "%0A" +
      "Status: " + order.status;
  }

  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
  window.open(whatsappURL, "_blank");
}

function renderOrders() {
  const tbody = document.getElementById("orderTableBody");
  const searchInput = document.getElementById("searchOrder");
  const searchValue = searchInput ? searchInput.value.toLowerCase() : "";
  tbody.innerHTML = "";

  const filteredOrders = orders.filter((order) => {
    return (
      order.date.toLowerCase().includes(searchValue) ||
      order.product.toLowerCase().includes(searchValue) ||
      order.name.toLowerCase().includes(searchValue) ||
      order.customerWhatsapp.toLowerCase().includes(searchValue) ||
      order.status.toLowerCase().includes(searchValue) ||
      order.comment.toLowerCase().includes(searchValue)
    );
  });

  filteredOrders.forEach((order) => {
    const row = document.createElement("tr");

    if (order.status === "Accepted") {
      row.classList.add("accepted-row");
    }

    const statusClass =
      order.status === "Accepted" ? "status-accepted" : "status-pending";

    row.innerHTML = `
      <td>${order.date}</td>
      <td>${order.product}</td>
      <td>${order.name}</td>
      <td>${order.customerWhatsapp}</td>
      <td>${order.qty}</td>
      <td>${order.price}</td>
      <td>${order.total}</td>
      <td>${order.comment}</td>
      <td class="${statusClass}">${order.status}</td>
      <td>
        ${
          order.status === "Pending"
            ? `<button class="action-btn accept-btn" onclick="acceptOrder(${order.id})">Accept</button>`
            : `<button class="action-btn accept-btn" disabled>Accepted</button>`
        }
        <button class="action-btn edit-btn" onclick="editOrder(${order.id})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteOrder(${order.id})">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function acceptOrder(orderId) {
  const order = orders.find((item) => item.id === orderId);

  if (!order) return;

  order.status = "Accepted";
  saveOrders();
  renderOrders();
  showAcceptanceNotification(order);
}

function editOrder(orderId) {
  const order = orders.find((item) => item.id === orderId);

  if (!order) return;

  const newDate = prompt("Edit Date:", order.date);
  if (newDate === null) return;

  const newName = prompt("Edit Customer Name:", order.name);
  if (newName === null) return;

  const newPhone = prompt("Edit Customer WhatsApp Number:", order.customerWhatsapp);
  if (newPhone === null) return;

  const newQty = order.product === "Services" ? "-" : prompt("Edit Quantity:", order.qty);
  if (newQty === null) return;

  const newComment = prompt("Edit Comment:", order.comment);
  if (newComment === null) return;

  order.date = newDate.trim();
  order.name = newName.trim();
  order.customerWhatsapp = newPhone.trim();

  if (order.product !== "Services") {
    order.qty = newQty;
    order.price = getPrice(order.product);
    order.total = Number(order.qty) * Number(order.price);
  }

  order.comment = newComment.trim() || "-";

  saveOrders();
  renderOrders();
}

function deleteOrder(orderId) {
  const confirmDelete = confirm("Are you sure you want to delete this order?");

  if (!confirmDelete) return;

  orders = orders.filter((item) => item.id !== orderId);
  saveOrders();
  renderOrders();
}

function showAcceptanceNotification(order) {
  const message = `Order accepted for ${order.name} (${order.product})`;

  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("SK Online", {
        body: message
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("SK Online", {
            body: message
          });
        } else {
          alert(message);
        }
      });
    } else {
      alert(message);
    }
  } else {
    alert(message);
  }
}

function saveOrders() {
  localStorage.setItem("skOnlineOrders", JSON.stringify(orders));
}

function resetForm() {
  document.getElementById("date").value = "";
  document.getElementById("product").value = "";
  document.getElementById("name").value = "";
  document.getElementById("customerWhatsapp").value = "91";
  document.getElementById("qty").value = "";
  document.getElementById("price").value = "";
  document.getElementById("comment").value = "";
  document.getElementById("total").innerText = "0";
  document.getElementById("serviceCommentBox").classList.add("hidden");
}

renderOrders();