// Variables 
let cartBtn = document.querySelector(".cart-btn");
let closeCartBtn = document.querySelector(".close-cart");
let clearCartBtn = document.querySelector(".clear-cart")
let cartDOM = document.querySelector(".cart");
let cartOverlay = document.querySelector(".cart-overlay");
let cartItems = document.querySelector(".cart-items");
let cartTotal = document.querySelector(".cart-total")
let cartContent = document.querySelector(".cart-content");
let productsDOM = document.querySelector(".products-center");

//Cart
let cart = [];

//Buttons
let buttonsDOM = [];

// getting products
class Products{
    async getProducts(){
       try {
        let result = await fetch('Assets/JSON/products.json');
        let data = await result.json();
        let products = data.items;
        products = products.map(item=>{
            const {title,price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return {title,price,id,image}
        })
        return products
       } catch (error) {
           console.log(error);
       }
    }
}

// display products
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src="${product.image}" alt="product" class="product-img">
                <button class="bag-btn" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    Add to cart
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>₹${product.price}</h4>
        </article>`
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons(){
        let buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach((button) => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id )
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click',(event)=>{
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                //Get products from products
                let cartItem = {...Storage.getProduct(id),amount:1};
                //add product to the cart
                cart = [...cart,cartItem]
                //save the cart in local storage
                Storage.saveCart(cart);
                //set cart values
                this.setCartValues(cart);
                //display cart items
                this.addCartItem(cartItem);
                //show the cart
                this.showCart();
            })
        })
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item=>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item-div')
        div.innerHTML = `
        <div class="cart-item">
        <img src="${item.image}" alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>₹${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
    </div>
        `
        cartContent.appendChild(div);
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart'); 
    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click',this.hideCart);
    }
    populateCart(){
        cart.forEach(item=>{
            this.addCartItem(item)
        })
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> ADD TO CART`
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id)
    }
    cartLogic(){
        //Clear cart button
        clearCartBtn.addEventListener('click',()=>{
            this.clearCart();
        })
        //cart functionality
        cartContent.addEventListener('click',event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement.parentElement);
                this.removeItem(id);
            }
            else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount >  0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement.parentElement)
                    this.removeItem(id);
                } 
            }
        })
    }
}

// local storage
class Storage{
    static saveProduct(product){
        localStorage.setItem("products",JSON.stringify(product));

    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}

document.addEventListener('DOMContentLoaded',()=>{
    const ui  = new UI();
    const products = new Products();
    //Setup app
    ui.setupAPP();
    //Get all products
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProduct(products)
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    })
})