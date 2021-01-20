//Contenful SetUp
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "7b1b6letsu5r",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "6ZaKaPF1P_qYdP7w8NEbctVLzEywWlES8KCI4XswgQ0"
  });

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  })

//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-btn .cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const cartTitle = document.querySelector('.cart-title');
const checkoutBtn = document.querySelector('.checkout-items');

const body = $(document.body);
//cart
let cart = [];

//buttons
let buttonsDOM = [];

// class Products { //To fetch from Json file
//      async getProducts() {
//          try {
//             let result = await fetch('data.json');
//             let data = await result.json();
//             let products = data.items;
//             products = products.map(item => {
//                 const {title, price} = item.fields;
//                 const {id} = item.sys;
//                 const image = item.fields.image.fields.file.url;
//                 return {title, price, id, image}
//             })
//             return products;
//          } catch (error) {
//              console.log(error);
//          }
//      }
// }

class Products {
    async getProducts() {
        try {
           let contenful = await client.getEntries({
               content_type: 'truck'
           });
           
           let products = contenful.items;
           products = products.map(item => {
               const {title, price, make, model, year, mileage} = item.fields;
               const {id} = item.sys;
               const image = item.fields.image[0].fields.file.url;
               return {title, price, make, model, year, mileage, id, image}
           })
           return products;
        } catch (error) {
            console.log(error);
        }
    }
}

class UI {
    displayProducts(products) {
        let result ='';
        products.forEach(product => {
            result += 
                    `<article class="product">
                        <div class="img-container">
                            <img src=${product.image} alt=${product.make} class="product-img">
                            <button class="bag-btn" data-id=${product.id}>
                                <i class="fas fa-shopping-cart"></i>add to cart
                            </button>
                        </div>
                        <h3>${product.title}</h3>
                        <h4>${formatter.format(product.price)}</h4>
                    </article>`
        });
        productsDOM.innerHTML = result;
    }

    getBagButtons() {
        const btns = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = btns;

        btns.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            
            if(inCart) {
                button.innerText = "In Cart";
                var z = document.createElement('i');
                z.className = 'fas fa-cart-arrow-down';
                button.appendChild(z);
                button.disabled = true;
                button.style.background = 'var(--mainItemInCart)';
                button.style.color = 'var(--mainWhite)';
            }

            button.addEventListener('click', (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                var z = document.createElement('i');
                z.className = 'fas fa-cart-arrow-down';
                button.appendChild(z);

                button.style.background = 'var(--mainItemInCart)';
                button.style.color = 'var(--mainWhite)';

                // Get product from products in localStorage
                let cartItem = {...Storage.getProduct(id), amount: 1};
                
                // Add product to the cart
                cart = [...cart, cartItem];
                
                // Save cart in local storage
                Storage.saveCart(cart);

                // Set cart values
                this.setCartValues(cart);

                // Display cart item
                this.addCartItem(cartItem);

                // Show the cart
                //this.showCart();
            });

            // cartOverlay.addEventListener('click', () => {
            //     this.hideCart();
            // });
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = 
                        `<img src=${item.image} alt="product">
                            <div>
                                <h4>${item.title}</h4>
                                <h5>$${item.price}</h5>
                                <span class="remove-item" data-id=${item.id}>remove</span>
                            </div>
                            <div>
                                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                                <p class="item-amount">${item.amount}</p>
                                <i class="fas fa-chevron-down" data-id=${item.id}></i>
                            </div>`

        cartContent.appendChild(div);
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
        body.css('overflow', 'hidden');
        body.css('margin-right', '15px');
        cart.length === 0 ? checkoutBtn.disabled = true : checkoutBtn.disabled = false;
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
        body.css('overflow', 'auto');
        body.css('margin-right', '0');
    }

    setUpApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart) {
        cart.forEach(item => {
            this.addCartItem(item);
        })
    }

    cartLogic() {
        //clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        //cart functionality
        cartContent.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-item')){
                let itemToRemove = event.target;
                let itemIdToRemove = itemToRemove.dataset.id;
                cartContent.removeChild(itemToRemove.parentElement.parentElement);  
                this.removeItem(itemIdToRemove);
            }
            else if (event.target.classList.contains('fa-chevron-up')) {
                let increaseItemAmount = event.target;
                let itemId = increaseItemAmount.dataset.id;
                let tempItem = cart.find(item => item.id === itemId);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                increaseItemAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains('fa-chevron-down')) {
                let decreaseItemAmount = event.target;
                let itemId = decreaseItemAmount.dataset.id;
                let tempItem = cart.find(item => item.id === itemId);
                tempItem.amount = tempItem.amount - 1;
                
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    decreaseItemAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else {
                    cartContent.removeChild(decreaseItemAmount.parentElement.parentElement);
                    this.removeItem(itemId);
                }
            }
        });
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }

        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
        button.style.background = 'var(--mainBadge)';
        button.style.color = 'var(--mainWhite)';
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        cartTitle.innerText = "your cart";
    }

    static getCart() {
        cart.length == 0 ? cartTitle.innerText = "cart is empty" : "your cart";
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    //SetUp app
    ui.setUpApp();

    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => { 
        ui.getBagButtons(); 
        ui.cartLogic();
    });
});

$(document).ready(function () {
    $('.banner-btn').click(function() {
    $('html, body').animate({
      scrollTop: $(".products").offset().top
    }, 1000)
  }),
  $('.navbar-dark img').click(function (){
    $('html, body').animate({
      scrollTop: $(".hero").offset().top
    }, 1000)
  })
});

// $(function(){
//     $("#render-content").load("/assets/views/checkout.html");
// });