const client = require('../scripts/redisClient')


let keys = ["6149d38f20bbcf62b117af43",
"627e43f593a2bd326c2e13cd",
"6130dc761ee03e38423def2e",
"60bcdcf13c1c2a1751864354",
"6149d74b20bbcf62b117af48",
"61dc0378562a8c99c73ceede",
"616413d61e1e791b0e4e3e82",
"6266456e93a2bd326c2e129f",
"627e42f193a2bd326c2e13cc",
"6149da0c20bbcf62b117af4b",
"6149d52b20bbcf62b117af46",
"61c32af6bd0dc54204101866",
"626fd61993a2bd326c2e1321",
"620259adb6957429b52b9207",
"624e857c93a2bd326c2e10f6",
"6149d47820bbcf62b117af44",
"61322ed01ee03e38423def39",
"6149d4d920bbcf62b117af45",
"626fd85193a2bd326c2e1322",
"627f515d93a2bd326c2e13d9",
"620b8c906f56269791a712ed",
"627e453c93a2bd326c2e13ce",
"6149da9b20bbcf62b117af4c"]

setTimeout((async () => {
	
	for (key of keys) {
			
		console.log(key)
		// continue
		try {
			let allSessions = await client.HGETALL(String(key))
			await Promise.allSettled(Object.keys(allSessions).map(s => client.HDEL(String(key), String(s))))
		}
		catch (err) {
			console.error(err)
		}
	}

}), 1000)