class RequestHelper {
  constructor() {
    this.API_url = HTTP_LINK;
  }
  async fetchGraphQL(operationsDoc, operationName, variables) {
    return fetch(this.API_url, {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
      headers: {
        "x-hasura-admin-secret": ADMIN_SECRET,
      },
    }).then((result) => result.json());
  }

  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyQuery", {});
  }

  async startFetchMyQuery(operationsDoc) {
    const { errors, data } = await this.fetchMyQuery(operationsDoc);

    if (errors) {
      console.error(`Query was not successful: ${errors}`);
      return null;
    }

    // do something great with this precious data
    console.log(data);
    return data;
  }

  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyMutation", {});
  }

  async startExecuteMyMutation(operationsDoc) {
    const { errors, data } = await this.executeMyMutation(operationsDoc);
    if (errors) {
      throw new Error(errors[0].message);
    }
    return data;
  }
}

export default new RequestHelper();
