import { json, type ActionFunction } from "@remix-run/node";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { Button, Card, Page, TextField } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";
import { useState } from "react";

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();

  const discountTitle = formData.get("discountTitle");
  const uniqueCode = `${discountTitle}-${Date.now()}`;
  console.log(discountTitle, "discount");
  try {
    const response = await admin.graphql(
      `#graphql
        mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
          discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
            codeDiscountNode {
              codeDiscount {
                ... on DiscountCodeBasic {
                  title
                  codes(first: 10) {
                    nodes {
                      code
                    }
                  }
                  startsAt
                  endsAt
                  customerSelection {
                    ... on DiscountCustomerAll {
                      allCustomers
                    }
                  }
                  customerGets {
                    value {
                      ... on DiscountPercentage {
                        percentage
                      }
                    }
                    items {
                      ... on AllDiscountItems {
                        allItems
                      }
                    }
                  }
                  appliesOncePerCustomer
                }
              }
            }
            userErrors {
              field
              code
              message
            }
          }
        }`,
      {
        variables: {
          basicCodeDiscount: {
            title: discountTitle,
            code: uniqueCode,
            startsAt: "2024-09-24T00:00:00Z",
            endsAt: "2025-09-25T00:00:00Z",
            customerSelection: {
              all: true,
            },
            customerGets: {
              value: {
                percentage: 0.3,
              },
              items: {
                all: true,
              },
            },
            appliesOncePerCustomer: true,
          },
        },
      },
    );

    if (response.ok) {
      const responseJson = await response.json();
      console.log("ok");

      return json({ discount: responseJson.data });
    }
    return null;
  } catch (err) {
    console.log(err);
  }
  return null;
};

const Discounts = () => {
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();

  console.log(actionData, "action data");

  const generateDiscount = () => submit({}, { replace: true, method: "POST" });

  const [discountTitle, setDiscountTitle] = useState("");
  return (
    <Page>
      <Card>
        <h1>Discount Page</h1>
        <Form onSubmit={generateDiscount} method="POST">
          <TextField
            name="discountTitle"
            id="discountTitle"
            label="Discount"
            autoComplete="off"
            value={discountTitle}
            onChange={(value) => setDiscountTitle(value)}
          />
          <Button submit>Create Discount</Button>
        </Form>
      </Card>
    </Page>
  );
};

export default Discounts;
