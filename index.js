
var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');





var app = express();
app.use(express.static('public'));
app.set('view engine','ejs');

app.listen(8080);
app.use(bodyParser.urlencoded( {extended:true}));
app.use(session({secret:"secret"}))


function isProductInCart(cart,id){
    for(let i=0;i<cart.length;i++)
    {
        if(cart[i].id ==id)
        {
            return true;
        }
    }
    return false;

}


function calculateTotal(cart,req){
    let total = 0;
    for(let i=0;i<cart.length;i++){
        // if we're offering a discounted price
        if(cart[i].sale_price){
            total = total + (cart[i].sale_price*cart[i].quantity);
        }else{
            total = total + (cart[i].price * cart[i].quantity);
        }
    }
req.session.total =total;
return total;

}



//localhost:8080
app.get('/',function(req,res){

    var con = mysql.createConnection({

        host:"localhost",
        user:"root",
        password:"",
        database:"node_project"
    })

    con.query("SELECT * FROM products", (err,result)=>{
        res.render('pages/index',{result:result});
    });

});

app.post('/add_to_cart',function(req,res){

    var id = req.body.id;
    var name =req.body.name;
    var price = req.body.price;
    var sale_price = req.body.sale_price;
    var quantity = req.body.quantity;
    var image = req.body.image;
    var product ={id:id,name:name,price:price,sale_price:sale_price,quantity:quantity,image:image };

    if (req.session.cart){
        var cart = req.session.cart;
        if(! isProductInCart(cart,id)){
            cart.push(product);
        }
    }else{
            req.session.cart = [product];
            var cart = req.session.cart;
        }



        //calculate the total 
        calculateTotal(cart,req);

        //return cart page
        res.redirect('/cart')
    
});

app.get('/cart',function(req,res){
    var cart = req.session.cart;
    var total =req.session.total;

    res.render('pages/cart',{cart:cart,total:total});

});
app.post('/remove_product', function(req, res) {
    var id = req.body.id;
    var cart = req.session.cart;

    if (cart) {
        // remove the product with the given id
        cart = cart.filter(item => item.id != id);
        req.session.cart = cart;

        // recalc total
        calculateTotal(cart, req);
    }

    res.redirect('/cart');
});




