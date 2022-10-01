 const printNumbersForEverySec = (n)=>{
   for (var i = 1; i <= n; i++) {
       setTimeout( () =>{
         console.log(i)
       }, i * 1000)
     }
 }


    printNumbersForEverySec(5)

    // 5
    // 5
    // 5
    // 5
    // 5