import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, List, Page } from "@shopify/polaris";
import { apiVersion, authenticate } from "app/shopify.server";

export const query = `{
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          description
        }
      }
    }
  }`;

export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;

  try {
    const response = await fetch(
      `https://${shop}/admin/api/${apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/graphql",
          "X-Shopify-Access-Token": accessToken!,
        },
        body: query,
      },
    );

    if (response.ok) {
      const data = await response.json();

      const {
        data: {
          products: { edges },
        },
      } = data;
      return edges;
    }
    return null;
  } catch (error) {
    console.log(error);
  }
  return null;
};

const Products = () => {
  const products: any = useLoaderData();
  console.log(products, "products");

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <h1>Products Page</h1>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <List type="bullet" gap="loose">
              {products.map((edge: any) => {
                const { node: product } = edge;
                return (
                  <List.Item key={product.id}>
                    <h2>{product.title}</h2>
                    <h2>{product.description}</h2>
                  </List.Item>
                );
              })}
            </List>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Products;
