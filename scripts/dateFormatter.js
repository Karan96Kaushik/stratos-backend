const dateStr = `22/06/2021
16/06/2021
16/06/2021
17/06/2021
17/06/2021
21/06/2021
21/06/2021
21/06/2021
21/06/2021
21/06/2021
21/06/2021
21/06/2021
21/06/2021
22/06/2021
28/06/2021
28/06/2021
28/06/2021
28/06/2021
30/06/2021
30/06/2021
30/06/2021
01/07/2021
01/07/2021
08/07/2021
12/07/2021
13/07/2021
13/07/2021
14/07/2021
14/07/2021
14/07/2021
15/07/2021
16/07/2021
17/07/2021
17/07/2021
17/07/2021
17/07/2021
17/07/2021
20/07/2021
21/07/2021
21/07/2021
22/07/2021
22/07/2021
22/07/2021
29/07/2021
29/07/2021
02/08/2021
03/08/2021
03/08/2021
03/08/2021
04/08/2021
04/08/2021
04/08/2021
04/08/2021
04/08/2021
05/08/2021
16/08/2021
16/08/2021
16/08/2021
18/08/2021
18/08/2021
25/08/2021
23/08/2021
25/08/2021
26/08/2021
27/08/2021
27/08/2021
27/08/2021
28/08/2021
31/08/2021
30/08/2021
02/09/2021
03/09/2021
08/09/2021
08/09/2021
09/09/2021
09/09/2021
16/09/2021
16/09/2021
17/09/2021
20/09/2021
21/09/2021
21/09/2021
21/09/2021
23/09/2021
24/09/2021
28/09/2021
`

let dateArr = dateStr.split('\n')

dateArr.forEach(d => {

	d = new Date(d.split("/").reverse().join('-'))

	console.log(d)
})
