<script>
  import http from "./helper/request-helper";
  import { OperationsDocHelper } from "./helper/operations-doc-helper";
  import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { writable } from "svelte/store";

  const isLoading = writable(false);

  const newCountry = {};
  const deleteCountry = {};

  const offline = writable(false);

  window.onoffline = () => {
    offline.set(true);
  };
  window.ononline = () => {
    offline.set(false);
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
      isLoading.set(true);
      await http.startExecuteMyMutation(
        OperationsDocHelper.MUTATION_insert(city, country, population),
      );
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.set(false);
    }
    newCountry.city = "";
    newCountry.country = "";
    newCountry.population = "";
  };

  const deleteCity = async (id) => {
    try {
      isLoading.set(true);

      await http.startExecuteMyMutation(
        OperationsDocHelper.MUTATION_deleteOnCity(id),
      );
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.set(false);
    }
  };
</script>

<main>
  {#if !$offline}
    {#if $isLoading}
      <img alt="loader" src="./loader.gif" />
    {:else}
      <body>
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
          <table border="1" class="ourTable">
            <caption>Cities</caption>
            <tr>
              <th>City</th>
              <th>Country</th>
              <th>Population</th>
              <th>Delete</th>
            </tr>
            {#if $cities.data.laba3_cities.length}
              {#each $cities.data.laba3_cities as cities (cities.id)}
                <tr>
                  <td>{cities.city_name}</td>
                  <td>{cities.country_name}</td>
                  <td>{cities.population}</td>
                  <td
                    ><button class="btn" on:click={() => deleteCity(cities.id)}
                      >Delete city</button
                    ></td
                  >
                </tr>
              {/each}
            {:else}
              <h1>No cities</h1>
            {/if}
          </table>
        {/if}
      </body>
    {/if}
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
</style>
