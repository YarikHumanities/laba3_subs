<script>
  import http from "./helper/request-helper";
  import { OperationsDocHelper } from "./helper/operations-doc-helper";
  import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { writable } from "svelte/store";

  export const userMsg = writable("");
  //const isLoading = writable(false);
  let isLoading = "";

  const newCountry = {};
  const deleteCountry = {};

  //const offline = writable(false);
  let offline = "";

  window.onoffline = () => {
    //offline.set(true);
    offline = true;
  };
  window.ononline = () => {
    //offline.set(false);
    offline = false;
  };

  function createApolloClient() {
    const headers = {
      "x-hasura-admin-secret": ADMIN_SECRET,
    };
    const wsLink = new WebSocketLink({
      uri: WS_LINK,
      options: {
        recconect: true,
        connectionParams: {
          headers,
        },
      },
    });

    const cache = new InMemoryCache();
    return new ApolloClient({
      link: wsLink,
      cache,
    });
  }

  const client = createApolloClient();
  setClient(client);

  const cities = subscribe(OperationsDocHelper.SUBSCRIPTION_all());

  const addCity = async () => {
    const { city, country, population } = newCountry;
    if (!city || !country || !population) return;
    try {
      //isLoading.set(true);
      isLoading = true;
      await http.startExecuteMyMutation(
        OperationsDocHelper.MUTATION_insert(city, country, population),
      );
      $userMsg = "Added";
    } catch (e) {
      console.error(e);
      $userMsg = `Error: ${e.message}`;
    } finally {
      //isLoading.set(false);
      isLoading = false;
    }
    newCountry.city = "";
    newCountry.country = "";
    newCountry.population = "";
  };

  const deleteCity = async (id) => {
    try {
      isLoading = true;

      await http.startExecuteMyMutation(
        OperationsDocHelper.MUTATION_deleteOnCity(id),
      );
      $userMsg = "Delete done";
    } catch (e) {
      console.error(e);
      $userMsg = `Error: ${e.message}`;
    } finally {
      isLoading = false;
    }
  };
</script>

<main>
  {#if !offline}
    <!-- {#if isLoading} -->
      
    <!-- {:else} -->
      <body>
        <div class="label_mass">{$userMsg}</div>
        {#if $cities.loading}
          <h1>Loading</h1>
        {:else if $cities.error}
          <h1>Error</h1>
        {:else if $cities.data}
          <div>
            <div>
              <input
                placeholder="Enter city name"
                bind:value={newCountry.city}
              />
              <input
                placeholder="Enter country name"
                bind:value={newCountry.country}
              />
              <input
                placeholder="Enter population"
                bind:value={newCountry.population}
              />
              <button class="btn" on:click={addCity}>Add</button>
            </div>

            <div />
          </div>

          {#if isLoading}
          <img class="spinner" alt="loader" src="./loader.gif" />
          {/if}

          <table border="1" class="ourTable">
            <caption>Cities</caption>
            <tr>
              <th>City</th>
              <th>Country</th>
              <th>Population</th>
              <th>Delete</th>
            </tr>
            
            {#if $cities.data.laba3_cities?.length}
              {#each $cities.data.laba3_cities as cities (cities.id)}
                <tr>
                  <td>{cities.city_name}</td>
                  <td>{cities.country_name}</td>
                  <td>{cities.population}</td>
                  <td><button class="btn" on:click={() => deleteCity(cities.id)}>Delete city</button></td>
                </tr>
              {/each}
            {:else}
              <h1>No cities</h1>
            {/if}
          </table>

        {/if}
      </body>
    <!-- {/if} -->
  {:else}
    <h1>You are offline</h1>
  {/if}
</main>

<style>
  :root {
    --green: #4caf50;
    --white: #fff;
  }
  .btn {
    background-color: var(--green);
    border: none;
    color: var(--white);
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin-left: auto;
    margin-right: auto;
  }
  .btn:hover {
    opacity: 0.7;
  }
  .ourTable {
    margin-left: auto;
    margin-right: auto;
  }
  .spinner {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    height: 800px;
    width: 1000px;
  }
</style>
