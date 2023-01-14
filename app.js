'use strict';
// --- Storage Controller ---

const StorageController = (function(){

    return {
        storeProduct: function(storeProduct){
            
            let products;
            if (localStorage.getItem('products')===null) {
                // localStorage da herhangi bir products yoksa...
                products = [];
                products.push(storeProduct);
            }else {
                // varsa
                products = JSON.parse(localStorage.getItem('products')); // local storage içinden products olarak tanımlı alanı alacağız.
                // veriyi parse edip json objesine çevirerek alıyoruz.
                products.push(storeProduct);
            }
            localStorage.setItem('products', JSON.stringify(products)); // gönderdiğimiz objenin string bir bilgi olması lazım.
        },
        getProducts: function() {
            
            let products;
            if(localStorage.getItem('products') === null){
                products = [];
            }else {
                products = JSON.parse(localStorage.getItem('products'));
            }
            return products;
        },
        updatedProduct: function(updatedProduct) {
            let products = JSON.parse(localStorage.getItem('products')); // önce storage da ki verileri alalım.
            products.forEach((element,index) => {
                if (updatedProduct.id == element.id) { // güncellenen veri id si ile localstorage da ki id eşitse güncellenmesi gereken storage elemanı bulunmuş demektir.
                    products.splice(index,1,updatedProduct); // değişen yere updatedProduct ekleniyor. O da zaten güncellenen veri. tek diziden bir obje silinip yerine güncel veri ekleniyor.
                }
            });
            localStorage.setItem('products', JSON.stringify(products));
        },
        deleteProduct: function(deletedProductId) {
            let products = JSON.parse(localStorage.getItem('products'));
            products.forEach((element,index) => {
                if (element.id == deletedProductId) {
                    products.splice(index,1);
                }
            });
            localStorage.setItem('products',JSON.stringify(products)); 
        }
    }

})();

// --- Product Controller ---

const ProductController = (function(){

    // Private
    const Product = function(id,name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    const data = {
        'product': StorageController.getProducts(),
        'selectedProduct': null,
        'totalPrice': 0
    }

    // Public
    return {
        getProducts: function() {
            return data.product;
        },
        getData: function() {
            return data;
        },
        addProduct: function(name, price) {
            let id;
            if(data.product.length > 0){
                id = data.product[data.product.length-1].id+1;
            } else {
                id=0;
            }
            
            const newProduct = new Product(id,name,parseFloat(price));
            data.product.push(newProduct);
            return newProduct;
        },
        getTotal:  function() {
            let total = 0;
            data.product.forEach(element => {
               total += element.price;
            });
            data.totalPrice = total;
            return data.totalPrice;
        },
        getProductById: function(id) {
            let product = null;
            data.product.forEach(element => {
                if(element.id == id)
                product = element;
            });
            return product;
        },
        setCurrentProduct: function(product) {
            data.selectedProduct = product;
        },
        getCurrentProduct: function() {
            return data.selectedProduct;
        },
        updateProduct: function(name, price) {
            let updateProduct = null;
            data.product.forEach(element => {
                // update ikonuna tıkladığımız an zaten seçili nesneyi selectedProduct key ine yüklemiş oluyoruz.
                if (element.id == data.selectedProduct.id) {
                    element.name = name;
                    element.price = parseFloat(price);
                    updateProduct = element;
                }
            });
            return updateProduct;
        },
        deleteProduct: function(deleteProduct) {
            data.product.forEach((element, index) => { // forEach özelliği... index işlemden geçen elemanın (element) indeksidir.
                if(element.id == deleteProduct.id) {
                    data.product.splice(index,1);
                }
            });
        }
    }
    

})();


// --- UI Controller ---

const UIController = (function(){

    //private area
    const Selectors = {
        productList: "#item-list",
        productListItems: '#item-list tr',
        addBtn: ".addBtn",
        productName: '#productName',
        productPrice: '#productPrice',
        productCard: '#productCard',
        totalTL: '#total-tl',
        totalDolar: '#total-dolar',
        editButton: '#edit-button',
        updateButton: '.updateBtn',
        deleteButton: '.deleteBtn',
        cancelButton: '.cancelBtn'
    }

    // public area
    return {
       createProductList: function(products) {
        let html = '';
        products.forEach(element => {
            html += 
        `<tr>
            <td>${element.id}</td>
            <td>${element.name}</td>
            <td>${element.price}</td>
            <td id="edit-button">
                <i id="edit-icon" class="fa-solid fa-pen-to-square edit-product"></i>
            </td>
        </tr>`;
        });

        document.querySelector(Selectors.productList).innerHTML = html;
       },
       getSelectors: function() {
        return Selectors;
       },
       addProduct: function(product) {
        document.querySelector(Selectors.productCard).style.display = 'block';

        var item = 
        `<tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price} $</td>
            <td id="edit-button">
                <i id="edit-icon" class="fa-solid fa-pen-to-square edit-product"></i>
            </td>
        </tr>`;
        document.querySelector(Selectors.productList).innerHTML += item;
       },
       clearInputs: function() {
        document.querySelector(Selectors.productName).value ="";
        document.querySelector(Selectors.productPrice).value ="";
       },
       hideCard: function() {
        document.querySelector(Selectors.productCard).style.display = 'none';
       },
       showTotal: function(total) {
        document.querySelector(Selectors.totalDolar).textContent = total;
        document.querySelector(Selectors.totalTL).textContent = total*18; // burayı API DEN çekebiliriz.
       },
       addProductToForm: function() {
        const selectedProduct = ProductController.getCurrentProduct();
        document.querySelector(Selectors.productName).value = selectedProduct.name;
        document.querySelector(Selectors.productPrice).value = selectedProduct.price; 
        
       },
       addingState: function() {
        UIController.clearWarnings(); // addingState içinde silme yaptığımız kısmı clearWarnings de yazdık ve fonksiyonu burada çağırdık.
        UIController.clearInputs();
        document.querySelector(Selectors.addBtn).style.display = 'inline';
        document.querySelector(Selectors.updateButton).style.display = 'none';
        document.querySelector(Selectors.deleteButton).style.display = 'none';
        document.querySelector(Selectors.cancelButton).style.display = 'none';
       },
       editState: function(tr) {
        // const parent = tr.parentNode; //tbody gelir.
        // for (let i = 0; i < parent.children.length; i++) { // nodeList in içinde gezelim
        //     parent.children[i].classList.remove('bg-warning');   
        // }
        tr.classList.add('bg-warning');
        document.querySelector(Selectors.addBtn).style.display = 'none';
        document.querySelector(Selectors.updateButton).style.display = 'inline';
        document.querySelector(Selectors.deleteButton).style.display = 'inline';
        document.querySelector(Selectors.cancelButton).style.display = 'inline';
       },
       updateProduct: function(updatedProduct) {
        let updatedItem = null;
        // geriye gönderdiğimiz tr üzerinde işlemler yapmamız gerekiyor.
        let items = document.querySelectorAll(Selectors.productListItems);
        items.forEach(item => {
            if ((item.classList.contains('bg-warning'))) {
                item.children[1].textContent = updatedProduct.name;
                item.children[2].textContent = updatedProduct.price + ' $';
                updatedItem = item;
            }
        });
        return updatedItem;
       },
       deleteProduct: function(){
        let items = document.querySelectorAll(Selectors.productListItems);
        //console.log(items);
        items.forEach(element => {
            if(element.classList.contains('bg-warning')){
                element.remove();
            }
        });
       },
       clearWarnings: function() {
        // if(item){   // gelen item boş değilse...
        //     item.classList.remove('bg-warning');
        // }
        const items = document.querySelectorAll(Selectors.productListItems);
        items.forEach(element => {
            if(element.classList.contains('bg-warning')){
                element.classList.remove('bg-warning');
            }
        });
       }
    }
   
})();

// --- App Controller ---
const App = (function(ProductCont, UICont, StorageCont){
    // ilk devreye girmesi gereken modül. sayfa yüklendiğinde.


    // private area
    const UISelectors = UICont.getSelectors();
    
    // LOAD EVENT LISTENERS
    
    const loadEventListeners = function() {

        // add product event
        document.querySelector(UISelectors.addBtn).addEventListener('click', productAddSubmit);
        // edit product
        document.querySelector(UISelectors.productList).addEventListener('click', productEditClick);
        // Edit product submit
        document.querySelector(UISelectors.updateButton).addEventListener('click', editProductSubmit);
        // cancel edit product
        document.querySelector(UISelectors.cancelButton).addEventListener('click',cancelEditProduct);
        // delete product 
        document.querySelector(UISelectors.deleteButton).addEventListener('click',deleteProductSubmit);


    }

    const productAddSubmit = function(event) {
        
        const productName = document.querySelector(UISelectors.productName).value; 
        // input içerisinde ki value değerini aldık ve productName isimli değişkene atadık.
        const productPrice = document.querySelector(UISelectors.productPrice).value;
        //console.log(productName, productPrice);

        if(productName!== '' && productPrice!== '') {
            // you can add product and price because they arent' equal to null.
            const newProduct = ProductCont.addProduct(productName,productPrice);
            // add item to list
            UICont.addProduct(newProduct);
            // add product to local storage
            StorageCont.storeProduct(newProduct);


            //get total 
            const total = ProductController.getTotal();
            //console.log(total);
            // show total dolar value
            UICont.showTotal(total);
            // clear inputs 
            UICont.clearInputs();

        }

        event.preventDefault();
    }
    const productEditClick = function (event) {
       //console.log(event.target.classList.contains("edit-product")); // ikona tıklandığında true döner.
       
       if(event.target.classList.contains("edit-product")){
        //console.log("doğru yerdesiniz.")
        // artık ikona tıklandığı zaman ne yapılmasını istiyorsak bu fonksiyonda yazabiliriz.
        // seçili ikonun id sine ulaşarak gerekli işlemleri yapabiliriz. previous node larına.
        const id = event.target.parentNode.previousElementSibling.
        previousElementSibling.previousElementSibling.textContent; // amele yöntem :D 
        // get selected product
        const product = ProductCont.getProductById(id);
    
        // set current product
        ProductCont.setCurrentProduct(product);

        // add product to UI
        UIController.addProductToForm();
        //console.log(event.target.parentNode.parentNode);
        UICont.clearWarnings();
        UICont.editState(event.target.parentNode.parentNode); // tr etiketini göndermiş oluruz.
       }
       
        event.preventDefault(); // bu event normalde nasıl davranıyorsa o şekilde davranmamsı için. submit olayını durdurduk.
    }

    const editProductSubmit = function(event) {

        //console.log('update button clicked!');
        const productName = document.querySelector(UISelectors.productName).value; 
        // input içerisinde ki value değerini aldık ve productName isimli değişkene atadık.
        const productPrice = document.querySelector(UISelectors.productPrice).value;

        if(productName!== '' && productPrice!==''){

            // update product
            const updatedProduct = ProductCont.updateProduct(productName,productPrice);
            
            //update UI
            let item = UICont.updateProduct(updatedProduct);

            //get total 
            const total = ProductController.getTotal();
            
            // send to updated product to local storage
            StorageCont.updatedProduct(updatedProduct);

            // show total dolar value
            UICont.showTotal(total);
            UICont.addingState();
 
        }
        event.preventDefault();
    }

    const cancelEditProduct = function(event) {
        UICont.addingState(); 
        UICont.clearWarnings();
        event.preventDefault();

    }
    const deleteProductSubmit = function(event) {

        // get selected product
        const selectedProduct = ProductCont.getCurrentProduct();
        // delete product
        ProductCont.deleteProduct(selectedProduct);
        // delete product on UI
        UICont.deleteProduct();
        // delete from localstorage
        StorageCont.deleteProduct(selectedProduct.id);
        //get total
        const total = ProductController.getTotal();
        // show total dolar value
        UICont.showTotal(total);
        
        // tekrar ekleme durumu
        UICont.addingState(); 
        if(total == 0) {
            UICont.hideCard();
        }
        event.preventDefault(); // butona tıkladıktan sonra sayfayı yenilememesi için
        
    }

    // public alanlar için 
    return {
        init: function() {

            console.log('Starting app...');
            UICont.addingState();
            const total = ProductController.getTotal();
            // show total dolar value
            UICont.showTotal(total);
            const products = ProductCont.getProducts();
            if (products.length == 0) {
                UICont.hideCard();
            }else {
                UICont.createProductList(products);
            }
            // CALL EVENT LISTENERS
            loadEventListeners();
        }
    } 
    
    
})(ProductController, UIController, StorageController);

App.init();