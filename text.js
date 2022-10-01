 const printNumbersForEverySec = (n)=>{
    // console.log(i)
   for (let i = 1; i <= n; i++) {
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