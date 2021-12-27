<script>
import http from './helper/request-helper';
import {OperationsDocHelper} from './helper/operations-doc-helper'
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setClient, subscribe } from "svelte-apollo";
import { WebSocketLink } from "@apollo/client/link/ws";

function createApolloClient() {
   const wsLink = new WebSocketLink({
     uri: "wss://our-table.herokuapp.com/v1/graphql",
	 options: {
		 recconect: true,
	 },
   });

   const cache = new InMemoryCache();
   const client = new ApolloClient({
     link: wsLink,
     cache,
   });
   return client;
 }

 const client = createApolloClient();
 setClient(client);
 


const cities = subscribe(OperationsDocHelper.SUBSCRIPTION_all);

//window.onload = async () =>{
	
	//const {laba3_cities} = await http.startFetchMyQuery(OperationsDocHelper.QUERY_get_all());
	//cities=laba3_cities;
	//renderTable();
//}

//const renderTable = () => {
	//const table = document.querySelector('table')

	//cities.forEach(city => {
		//table.innerHTML+=`<tr>
			//<td>${city.city_name}</td>
			//<td>${city.country_name}</td>
			//<td>${city.population}</td>
			//</tr>`;
	//})

//}

const convert = (string) => {
	return isNaN(+string)?0:+string
}

const addCity = async () => {
	const naming = prompt("City: ") ?? "";
	const country = prompt("Country: ") ?? "";
	const people = convert(prompt("Population: ") ?? "");
	//console.log(naming);
	if(!naming || !country || !people) return
	/*const {insert_laba3_cities} = */await http.startExecuteMyMutation(OperationsDocHelper.MUTATION_insert(naming, country, people));
	//const {returning} = insert_laba3_cities;
	//cities.push(returning[0]);
	//renderTable();
	//console.log(result);
}

const deleteCityOnCounrty = async () => {
	const country = prompt("Country: ") ?? "";
	/*const {delete_laba3_cities} = */await http.startExecuteMyMutation(OperationsDocHelper.MUTATION_deleteOnCountry(country));
	//const {returning} = delete_laba3_cities;
	//cities.push(returning[0]);
	//renderTable();

}

const deleteCity = async () => {
	const city = prompt("City: ") ?? "";
	const {delete_laba3_cities}=await http.startExecuteMyMutation(OperationsDocHelper.MUTATION_deleteOnCity(city));
	const {returning} = delete_laba3_cities;
	//renderTable();
}

</script>

<main> 
	<!--{JSON.stringify($cities)} -->
	{#if $cities.loading}
	<h1>Loading</h1>
	{:else if $cities.error}
	<h1>Error</h1>
	{:else if $cities.data}
	<button on:click={addCity}>Add</button>
	<button on:click={deleteCity}>Delete city</button>
	<button on:click={deleteCityOnCounrty}>Delete country</button>
	<table border="1">
		<caption>Cities</caption>
		<tr>
			<th>City</th>
			<th>Country</th>
			<th>Population</th>
		</tr>
		{#each $cities.data.laba3_cities as cities (cities.id)}
		<tr>
			<td>{cities.city_name}</td>
			<td>{cities.country_name}</td>
			<td>{cities.population}</td>
		</tr>  
		{/each}
		
	</table>
	{/if}
	<!-- <button on:click={addCity}>Add</button>
	<button on:click={deleteCity}>Delete city</button>
	<button on:click={deleteCityOnCounrty}>Delete country</button>
	<table border="1">
		<caption>Cities</caption>
		<tr>
			<th>City</th>
			<th>Country</th>
			<th>Population</th>
		</tr>
	</table> -->
</main>

<style>
</style>