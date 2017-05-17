//Node application that creation displaying all items available for sale.(Ids, names, and prices of products for sale)

//Required node modules and dependencies 
var mysql = require("mysql"); 
var inquirer = require("inquirer"); 

//Connects to the database
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,	
	user: "root",
	password: "Kayemy#1",
	database: "Bamazon_db"
});

connection.connect(function(err){
	if (err) throw err;
	console.log("connected as id " + connection.threadId);

	//Displays list of available products 
	displayProducts();

});

//Displays list of available products.
 var displayProducts = function(){
 	var query = "Select * FROM products";
	connection.query(query, function(err, res){
		console.log('Welcome to THE BAMAZON Store!!');
		console.log("==============================");
		
		if (err) throw err;
		
		for (var i = 0; i < res.length; i++){
				console.log("Product ID: " + res[i].item_id + " || Product Name: " +
											res[i].product_name + " || Price: " + res[i].price);
		}//end of loop
            
          requestProduct(); 
        });
};


//Requests product and number of products items user wishes to purchase.
var requestProduct = function() {
	inquirer.prompt([{
			name: "productID", //(string) name use when storing the answer in the answers hash
			type: "input", //(string) type of prompt
			message: "Please enter product ID for product you want.", // (string|function) The question to print.
			validate: function(value) { // receive user input and return true if value is valid and err if otherwise
					if(isNaN(value) === false){
						return true;
					}
					return false; 
			}//NaN function
		},{
			name: "productUnits",
			type: "input",
			message: "How many units do you want?",
			validate: function(value){
			 		if(isNaN(value) === false){

							return true;
			 		}
			 		return false
			 	}
		 
		 }]).then(function(answer) {

		//Queries database for selected product.
		var query = "Select stock_quantity, price, products_sales, department_name FROM products WHERE ?";
		connection.query(query, { item_id: answer.productID}, function(err,res){
		
		if (err) throw err;			

				
 				var available_stock = res[0].stock_quantity;//# in stock
 				var price_per_unit = res[0].price;// price of that unit 
 				var productSales = res[0].products_sales; // name of item 
				var productDepartment = res[0].department_name;//department where item is located 
				
					
 				//Checks if there is enough inventory to process user's reuqest
				if(available_stock >= answer.productUnits){ // greater than or equal too 
					
						
 						// Processes user's request passing in data to complete purchase
						completePurchase(available_stock, price_per_unit, productSales, productDepartment, answer.productID, answer.productUnits);
						
				}else {

 					//Tell user there isn't enough stock left
					console.log("There isn't enough stock left!");

 					//Let's user request new product
 					requestProduct();
 				}
				
 			});
		});
	}

//Completes user's request to purchase product 
 var completePurchase = function(stock_quantity, price, productSales, productDepartment, selectedProductID, selectedProductUnits){
//console.log(price);
		//Updates stock quantity once purchase complete 
	  	var updatedStockQuantity = stock_quantity - selectedProductUnits;
	  	//console.log(updatedStockQuantity)
	  	//Calcualates total price for purchase based on unit price, and number of units 
	  	var totalPrice = price * selectedProductUnits;
	  	//console.log(totalPrice);
	 	//Updates total sales
	 	var updatedProductSales = parseInt(productSales) + parseInt(totalPrice); // parses a string argument and returns an integer
	 	//console.log(updatedProductSales);
	 	//discuss with Zack - why parseINT is giving a NaN 
	 	//Updates stock quantity on the database based on user's purchase 
	 	var query = "UPDATE products SET ? WHERE ?";
	 	connection.query(query, [{
	  		stock_quantity: updatedStockQuantity,
	 		products_sales: updatedProductSales
  		}, {
	 		item_id: selectedProductID
	 	}], function(err,res) {
	 
	  		if(err) throw err;

		//Tells user purchase is a success
		console.log("Congratulations your purchase is complete!");

		//Display the total price for that purchase 
 		console.log("Your payment has been received in the amount of : " + totalPrice + "(\n) Please shop MY BAMAZON again soon!");

		//Updates depapartment revenue based on purchase 
		updateDepartmentRevenue(updatedProductSales, productDepartment);
	
	
	});//end of function(err/res)
};//end of function completePurchase

//Updates total sales for department after completed purchase
 var updateDepartmentRevenue = function(updatedProductSales, productDepartment) {

// 	//query database for total sales value for department
	var query = "Select total_sales FROM products WHERE ?";
	connection.query(query, {department_name: productDepartment}, function(err, res) {
	if(err) throw err;
	console.log(res);

		var departmentSales = res[0].total_sales;
		console.log(res[0].total_sales);

		var updatedDepartmentSales = parseInt(depatmentSales) + parseInt(updatedProductSales);

 		//Completes update to total sales for department
 		completeDepartmentSalesUpdate(updatedDepatmentSales, productDepartment);
 	});// end of query
 };//end of updatedepartmentRevenue 

 	//Completes update to total sales for department on database.
 var completeDepartmentSalesUpdate = function(updatedDepartmentSales, productDepartment) {

 	var query = " UPDATE departments SET ? WHERE ?";
 	connection.query(query, [{
 		total_sales: updatedDepartmentSales
 	}, { 
 		department_name: productDepartment

 	}], function(err, res) {

 		if(err) throw err;

		//Displays products so user can choose to make another purchase
		displayProducts();
 	});
 };
