"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetQueue = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path = require("path");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const events = require("@aws-cdk/aws-events");
const targets = require("@aws-cdk/aws-events-targets");
const iam = require("@aws-cdk/aws-iam");
const lambda = require("@aws-cdk/aws-lambda-nodejs");
const sqs = require("@aws-cdk/aws-sqs");
const core_1 = require("@aws-cdk/core");
/**
 * @stability stable
 */
class TweetQueue extends sqs.Queue {
    /**
     * @stability stable
     */
    constructor(parent, id, props) {
        super(parent, id, {
            retentionPeriod: props.retentionPeriodSec === undefined ? core_1.Duration.seconds(60) : core_1.Duration.seconds(props.retentionPeriodSec),
            visibilityTimeout: props.visibilityTimeoutSec === undefined ? core_1.Duration.seconds(60) : core_1.Duration.seconds(props.visibilityTimeoutSec),
        });
        const keyName = 'id';
        const table = new dynamodb.Table(this, 'CheckpointTable', {
            partitionKey: { name: keyName, type: dynamodb.AttributeType.STRING },
        });
        const fn = new lambda.NodejsFunction(this, 'Poller', {
            entry: path.join(__dirname, 'poller', 'index.ts'),
            timeout: core_1.Duration.minutes(15),
            environment: {
                CREDENTIALS_SECRET: props.secretArn,
                TWITTER_QUERY: props.query,
                QUEUE_URL: this.queueUrl,
                CHECKPOINT_TABLE_NAME: table.tableName,
                CHECKPOINT_TABLE_KEY_NAME: keyName,
            },
        });
        fn.addToRolePolicy(new iam.PolicyStatement({
            resources: [props.secretArn],
            actions: ['secretsmanager:GetSecretValue'],
        }));
        fn.addToRolePolicy(new iam.PolicyStatement({
            resources: [this.queueArn],
            actions: ['sqs:SendMessage', 'sqs:SendMessageBatch'],
        }));
        table.grantReadWriteData(fn);
        const interval = props.intervalMin === undefined ? 1 : props.intervalMin;
        if (interval > 0) {
            const timer = new events.Rule(this, 'PollingTimer', {
                schedule: events.Schedule.rate(core_1.Duration.minutes(interval)),
            });
            timer.addTarget(new targets.LambdaFunction(fn));
        }
    }
}
exports.TweetQueue = TweetQueue;
_a = JSII_RTTI_SYMBOL_1;
TweetQueue[_a] = { fqn: "cdk-tweet-queue.TweetQueue", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdlZXQtcXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0d2VldC1xdWV1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZCQUE2QjtBQUM3QixrREFBa0Q7QUFDbEQsOENBQThDO0FBQzlDLHVEQUF1RDtBQUN2RCx3Q0FBd0M7QUFDeEMscURBQXFEO0FBQ3JELHdDQUF3QztBQUV4Qyx3Q0FBeUM7Ozs7QUFtQnpDLE1BQWEsVUFBVyxTQUFRLEdBQUcsQ0FBQyxLQUFLOzs7O0lBQ3ZDLFlBQVksTUFBcUIsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDbkUsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7WUFDaEIsZUFBZSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1lBQzNILGlCQUFpQixFQUFFLEtBQUssQ0FBQyxvQkFBb0IsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDO1NBQ2xJLENBQUMsQ0FBQztRQUVILE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQztRQUNyQixNQUFNLEtBQUssR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ3hELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1NBQ3JFLENBQUMsQ0FBQztRQUVILE1BQU0sRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQ25ELEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDO1lBQ2pELE9BQU8sRUFBRSxlQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM3QixXQUFXLEVBQUU7Z0JBQ1gsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLFNBQVM7Z0JBQ25DLGFBQWEsRUFBRSxLQUFLLENBQUMsS0FBSztnQkFDMUIsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUN4QixxQkFBcUIsRUFBRSxLQUFLLENBQUMsU0FBUztnQkFDdEMseUJBQXlCLEVBQUUsT0FBTzthQUNuQztTQUNGLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3pDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDNUIsT0FBTyxFQUFFLENBQUMsK0JBQStCLENBQUM7U0FDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSixFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUN6QyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzFCLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixFQUFFLHNCQUFzQixDQUFDO1NBQ3JELENBQUMsQ0FBQyxDQUFDO1FBRUosS0FBSyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTdCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxXQUFXLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDekUsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO1lBQ2hCLE1BQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO2dCQUNsRCxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMzRCxDQUFDLENBQUM7WUFFSCxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2pEO0lBQ0gsQ0FBQzs7QUE1Q0gsZ0NBNkNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ0Bhd3MtY2RrL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyBldmVudHMgZnJvbSAnQGF3cy1jZGsvYXdzLWV2ZW50cyc7XG5pbXBvcnQgKiBhcyB0YXJnZXRzIGZyb20gJ0Bhd3MtY2RrL2F3cy1ldmVudHMtdGFyZ2V0cyc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnQGF3cy1jZGsvYXdzLWlhbSc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnQGF3cy1jZGsvYXdzLWxhbWJkYS1ub2RlanMnO1xuaW1wb3J0ICogYXMgc3FzIGZyb20gJ0Bhd3MtY2RrL2F3cy1zcXMnO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICdAYXdzLWNkay9jb3JlJztcblxuZXhwb3J0IGludGVyZmFjZSBUd2VldFF1ZXVlUHJvcHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHNlY3JldEFybjogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHF1ZXJ5OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGludGVydmFsTWluPzogbnVtYmVyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHJldGVudGlvblBlcmlvZFNlYz86IG51bWJlcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB2aXNpYmlsaXR5VGltZW91dFNlYz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFR3ZWV0UXVldWUgZXh0ZW5kcyBzcXMuUXVldWUge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBUd2VldFF1ZXVlUHJvcHMpIHtcbiAgICBzdXBlcihwYXJlbnQsIGlkLCB7XG4gICAgICByZXRlbnRpb25QZXJpb2Q6IHByb3BzLnJldGVudGlvblBlcmlvZFNlYyA9PT0gdW5kZWZpbmVkID8gRHVyYXRpb24uc2Vjb25kcyg2MCkgOiBEdXJhdGlvbi5zZWNvbmRzKHByb3BzLnJldGVudGlvblBlcmlvZFNlYyksXG4gICAgICB2aXNpYmlsaXR5VGltZW91dDogcHJvcHMudmlzaWJpbGl0eVRpbWVvdXRTZWMgPT09IHVuZGVmaW5lZCA/IER1cmF0aW9uLnNlY29uZHMoNjApIDogRHVyYXRpb24uc2Vjb25kcyhwcm9wcy52aXNpYmlsaXR5VGltZW91dFNlYyksXG4gICAgfSk7XG5cbiAgICBjb25zdCBrZXlOYW1lID0gJ2lkJztcbiAgICBjb25zdCB0YWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnQ2hlY2twb2ludFRhYmxlJywge1xuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6IGtleU5hbWUsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBmbiA9IG5ldyBsYW1iZGEuTm9kZWpzRnVuY3Rpb24odGhpcywgJ1BvbGxlcicsIHtcbiAgICAgIGVudHJ5OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAncG9sbGVyJywgJ2luZGV4LnRzJyksXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDE1KSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIENSRURFTlRJQUxTX1NFQ1JFVDogcHJvcHMuc2VjcmV0QXJuLFxuICAgICAgICBUV0lUVEVSX1FVRVJZOiBwcm9wcy5xdWVyeSxcbiAgICAgICAgUVVFVUVfVVJMOiB0aGlzLnF1ZXVlVXJsLFxuICAgICAgICBDSEVDS1BPSU5UX1RBQkxFX05BTUU6IHRhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgQ0hFQ0tQT0lOVF9UQUJMRV9LRVlfTkFNRToga2V5TmFtZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBmbi5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgcmVzb3VyY2VzOiBbcHJvcHMuc2VjcmV0QXJuXSxcbiAgICAgIGFjdGlvbnM6IFsnc2VjcmV0c21hbmFnZXI6R2V0U2VjcmV0VmFsdWUnXSxcbiAgICB9KSk7XG5cbiAgICBmbi5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgcmVzb3VyY2VzOiBbdGhpcy5xdWV1ZUFybl0sXG4gICAgICBhY3Rpb25zOiBbJ3NxczpTZW5kTWVzc2FnZScsICdzcXM6U2VuZE1lc3NhZ2VCYXRjaCddLFxuICAgIH0pKTtcblxuICAgIHRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShmbik7XG5cbiAgICBjb25zdCBpbnRlcnZhbCA9IHByb3BzLmludGVydmFsTWluID09PSB1bmRlZmluZWQgPyAxIDogcHJvcHMuaW50ZXJ2YWxNaW47XG4gICAgaWYgKGludGVydmFsID4gMCkge1xuICAgICAgY29uc3QgdGltZXIgPSBuZXcgZXZlbnRzLlJ1bGUodGhpcywgJ1BvbGxpbmdUaW1lcicsIHtcbiAgICAgICAgc2NoZWR1bGU6IGV2ZW50cy5TY2hlZHVsZS5yYXRlKER1cmF0aW9uLm1pbnV0ZXMoaW50ZXJ2YWwpKSxcbiAgICAgIH0pO1xuXG4gICAgICB0aW1lci5hZGRUYXJnZXQobmV3IHRhcmdldHMuTGFtYmRhRnVuY3Rpb24oZm4pKTtcbiAgICB9XG4gIH1cbn1cblxuIl19