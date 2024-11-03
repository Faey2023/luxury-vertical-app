import type { LoaderFunction } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Card, Layout, Page } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  console.log(session, "session");
  console.log(admin, "admin");

  try {
    const response = await admin.rest.resources.InventoryLevel.all({
      session: session,
      location_ids: "103117193504",
    });

    if (response) {
      console.log("hit");
      const data = response.data;
      console.log(data);

      return json({
        inventory: data,
      });
    }
    return null;
  } catch (err) {
    console.log(err, "error");
  }
  return null;
};

const Inventory = () => {
  const data: any = useActionData();
  console.log(data, "data");

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <h1>Inventory Page</h1>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card></Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Inventory;
