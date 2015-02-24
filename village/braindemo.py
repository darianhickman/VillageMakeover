__author__ = 'darianhickman'
import braintree

braintree.Configuration.configure(braintree.Environment.Sandbox,
                                  merchant_id="ybj36vd4t2hdppsh",
                                  public_key="ybvkjh6ywsj7s7p",
                                  private_key="c987e8f9315e9c78d76cab4f13c70c8b")


#CSE Key:	MIIBCgKCAQEA0weZNGUfE7cEfVOhRpSXKZqe9sRW7GA85i/eviZ/P1xx45beQ8bWr6IiFiT66y1CuhyO+u2l2Sq9fud5SA4gGkGeSBjLeg9PpoVeav6nbNwMvUSXZnsUwBktg/zdVdlFZffgZO4WKIb043nSKHcKqCxvwMn2DbKqrJ1udCx7dItQdizRFS1QPMNFQ6qHxFy0y9Y8OwUigpBHBkDlJ/ZKjLv+z2fOkB7yDZVwBTmG/XiudxonAN1zvvRd8F/t7S5LhhZR2/jughh5e5o7oYkKhoaFnnr08v4eo3FzzcrDKIg6UtHr7GSsM/cQ9O6rxhwimX4ZtU/PyMDS5RngxpMDpwIDAQAB

client_token = braintree.ClientToken.generate({
    "customer_id": a_customer_id
})


@app.route("/purchases", methods=["POST"])
def create_purchase():
  nonce = request.form["payment_method_nonce"]
  # Use payment method nonce here...
  result = braintree.Transaction.sale({
    "amount": "10.00",
    "payment_method_nonce": nonce
})