# ΞNUM Lessor

This project is a work-in-progress to provide a new service to manage leased ΞNUMs.

## Development Setup

This project is set up to work with VScode "devcontainers".

1. Create your own private environment variables:
   ```shell
   $ cp .devcontainer/private-sample.env .devcontainer/private.env
   ```
2. Modify the contents with appropriate values.
3. Open the project with VScode's "Remote-Containers" function.
4. Open a terminal in the container.
   1. Install dependencies:
      ```shell
      $ yarn
      ```
   2. Start service in "watch" mode to restart on code changes:
      ```shell
      $ yarn watch
      ```

numbers have an e164
numbers may have a lease

leases have a lessee
leases have an expiration date

lessees have a wallet address
lessees have messages

messages may be read
messages have a sent date
messages have a sent to number
messages have a sent from number
messages have a body encrypted by the lessees public key
