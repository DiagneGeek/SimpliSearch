import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

import theMagicFunctionThatWillChangeYourLife from './app/simplisearch-algo-pro-off.js'


const supabase = createClient('https://wrlaxgtgmiclprseeqri.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybGF4Z3RnbWljbHByc2VlcXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMDk4NzcsImV4cCI6MjA2MjU4NTg3N30.1WBo6M1iNd4kRo51P5JuKGDWsncpxWXQ7NfAkZKTUd0')
  
  const Select = (from, rows) => supabase.from(from).select(rows)

export const createSearchSystem = async (API_KEY) => {
 if (!API_KEY) {
  throw new ReferenceError('simpmisearch: You must provide your api key')
  return
 }
 
 const {data: users, error} = await Select('users', '*')
 if (error) {
   return console.error('Error loading data')
 }
 if (users.find(u => u.key === API_KEY)) {
  return theMagicFunctionThatWillChangeYourLife
 }else{
  return console.error('SimpliSearch: Your api key is not valid')
 }
}