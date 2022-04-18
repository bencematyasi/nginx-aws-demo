import * as pulumi from "@pulumi/pulumi";
import "mocha";
import * as assert from "assert";
pulumi.runtime.setMocks({
    newResource: function (args: pulumi.runtime.MockResourceArgs): { id: string, state: any } {
        return {
            id: args.inputs.name + "_id",
            state: {
                ...args.inputs,
            },
        };
    },
    call: function (args: pulumi.runtime.MockCallArgs) {
        return args.inputs;
    },
});


import * as infra from "./index";
describe("Infrastructure", function () {

    describe("#web", function () {
        const listenerPort = infra.listenerPort;
        it('verifies that ApplicationListener is listening on the proper port', async () => {
            pulumi.all([listenerPort]).apply(([port]) => {
                assert.strictEqual(port, 80)
            })

        })
    });

    describe("#cluster", function () {
        const cluterName = infra.cluterName;
        it('verifies that cluster has a name', async () => {
            pulumi.all([cluterName]).apply(([name]) => {
                assert.strictEqual(name, "cluster")
            })

        })
    });
});

