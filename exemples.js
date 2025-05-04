justonline

const filteredAndSorted = search({query: myQuery, list: myList, /* facultatifs options */})

//end

ex1

import search from './lib/search.js'

const todos = [
 "Finish my product",
 "Make my own js framework",
 "remove some side projects",
 "Learn Angular"
]

const text =  'finish my framework'

 const response = search({ query: text, list: todos })
 console.log(response)
 //Output: [ "Make my own js framework", "Finish my product",]

//end

ex2
 
 ...
 const response = search({
  query: e.target.value,
  list: todos,
  // query.length <= 3
  minLength: 3,
  // response.length must not exceed 2
  maxResults: 2,
  // if the relevence score of the item is greater than 0.5
  maxScore: 0.5
 })

//end

ex3

/* ___________ format into snake case __________*/
const snake_case = [
 "finish_my_product",
 "make_my_own_js_framework",
 "remove_some_side_projects",
 "learn_angular"
]

search({
 ...,
 formatTo: 'snakecase'
})

/* ___________ format into streaming snake case __________*/
const SCREAMING_SNAKE_CASE = [
 "FINISH_MY_PRODUCT",
 "MAKE_MY_OWN_JS_FRAMEWORK",
 "REMOVE_SOME_SIDE_PROJECTS",
 "LEARN_ANGULAR"
]

search({
 ...,
 formatTo: 'streamingsnakecase'
})

/* ___________ format into camel case __________*/
const camelCase = [
 "finishMyProduct",
 "makeMyOwnJsFramework",
 "removeSomeSideProjects",
 "learnAngular"
]

search({
 ...,
 formatTo: 'camelcase'
})


/* ___________ format into kebab case __________*/

// why not with "-" 😅
const kebab -
 case = [
  "finish-my-product",
  "make-my-own-js-framework",
  "remove-some-side-projects",
  "learn-angular"
 ]

search({
 ...,
 formatTo: 'kebabcase'
})

//end

ex4

const todos = [
{
 title: "Finish my product",
 tags: 'product code finalyze',
 id: 1
},
{
 title: "Make my own js framework",
 tags: "js javascript framework innovative",
 id: 2
}]

search({
 query,
 list: todos,
 targets: ['title', 'tags']
})

ex5

console.log(search({
 query: 'xyyzz',
 list: todos,
 targets: ['title', 'tags'],
 fallback: 'nothing is founded !'
})) // nothing is founded

//end

ex6

search({
 query: 'finish my',
 list: todos,
 formatTo: 'kebabcase',
 maxResults: 1,
 concat: (todo) => `&lt;li>${todo}&lt;/li>`,
 onFinish: ({ results, formatted, concated }) => {
  console.log(`
       concated: ${concated}\n 
            
       results: ${results}\n
          
       formatted: ${formatted}
     `)
  /* output:
     concated: &lt;li>finish-my-product&lt;/li>
            
     results:['finish-my-product']
          
     formatted: finish-my
  */
 }
})

//end

ex7
let ul = document.querySelector('ul')

search({
  query: 'finish my framework', 
  maxResults: 2,
  concat: (item) => `&lt;li>${item}&lt;/li>`,
  onFinish: ({concated}) => {
   ul.innerHTML = concated 
  }
})

// ul.innerHTML => &lt;li>Finish my product&lt;/li> &lt;li>Make my own js framework&lt;/li>

// end
