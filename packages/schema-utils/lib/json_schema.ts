// This is the json schema exported from browser-use, change page_id to tab_id
// TODO: don't know why zod can not generate the same schema, need to fix it
export const jsonNavigatorOutputSchema = {
  $defs: {
    ActionModel: {
      properties: {
        done: {
          anyOf: [
            {
              $ref: '#/$defs/DoneAction',
            },
            {
              type: 'null',
            },
          ],
          description: 'Complete task',
        },
        search_google: {
          anyOf: [
            {
              $ref: '#/$defs/SearchGoogleAction',
            },
            {
              type: 'null',
            },
          ],
          description:
            'Search the query in Google in the current tab, the query should be a search query like humans search in Google, concrete and not vague or super long. More the single most important items. ',
        },
        go_to_url: {
          anyOf: [
            {
              $ref: '#/$defs/GoToUrlAction',
            },
            {
              type: 'null',
            },
          ],
          description: 'Navigate to URL in the current tab',
        },
        go_back: {
          anyOf: [
            {
              $ref: '#/$defs/NoParamsAction',
            },
            {
              type: 'null',
            },
          ],
          description: 'Go back',
        },
        click_element: {
          anyOf: [
            {
              $ref: '#/$defs/ClickElementAction',
            },
            {
              type: 'null',
            },
          ],
          description: 'Click element',
        },
        input_text: {
          anyOf: [
            {
              $ref: '#/$defs/InputTextAction',
            },
            {
              type: 'null',
            },
          ],
          description: 'Input text into a input interactive element',
        },
        switch_tab: {
          anyOf: [
            {
              $ref: '#/$defs/SwitchTabAction',
            },
            {
              type: 'null',
            },
          ],
          description: 'Switch tab',
        },
        open_tab: {
          anyOf: [
            {
              $ref: '#/$defs/OpenTabAction',
            },
            {
              type: 'null',
            },
          ],
          description: 'Open url in new tab',
        },
        cache_content: {
          anyOf: [
            {
              $ref: '#/$defs/cache_content_parameters',
            },
            {
              type: 'null',
            },
          ],
          description: 'Cache what you have found so far from the current page so that it can be used in future steps',
        },
        scroll_down: {
          anyOf: [
            {
              $ref: '#/$defs/ScrollAction',
            },
            {
              type: 'null',
            },
          ],
          description: 'Scroll down the page by pixel amount - if no amount is specified, scroll down one page',
        },
        scroll_up: {
          anyOf: [
            {
              $ref: '#/$defs/ScrollAction',
            },
            {
              type: 'null',
            },
          ],
          description: 'Scroll up the page by pixel amount - if no amount is specified, scroll up one page',
        },
        send_keys: {
          anyOf: [
            {
              $ref: '#/$defs/SendKeysAction',
            },
            {
              type: 'null',
            },
          ],
          description:
            'Send strings of special keys like Backspace, Insert, PageDown, Delete, Enter, Shortcuts such as `Control+o`, `Control+Shift+T` are supported as well. This gets used in keyboard.press. Be aware of different operating systems and their shortcuts',
        },
        scroll_to_text: {
          anyOf: [
            {
              $ref: '#/$defs/scroll_to_text_parameters',
            },
            {
              type: 'null',
            },
          ],
          description: 'If you dont find something which you want to interact with, scroll to it',
        },
        get_dropdown_options: {
          anyOf: [
            {
              $ref: '#/$defs/get_dropdown_options_parameters',
            },
            {
              type: 'null',
            },
          ],
          description: 'Get all options from a native dropdown',
        },
        select_dropdown_option: {
          anyOf: [
            {
              $ref: '#/$defs/select_dropdown_option_parameters',
            },
            {
              type: 'null',
            },
          ],
          description:
            'Select dropdown option for interactive element index by the text of the option you want to select',
        },
      },
      title: 'ActionModel',
      type: 'object',
    },
    AgentBrain: {
      description: 'Current state of the agent',
      properties: {
        page_summary: {
          title: 'Page Summary',
          type: 'string',
        },
        evaluation_previous_goal: {
          title: 'Evaluation Previous Goal',
          type: 'string',
        },
        memory: {
          title: 'Memory',
          type: 'string',
        },
        next_goal: {
          title: 'Next Goal',
          type: 'string',
        },
      },
      required: ['page_summary', 'evaluation_previous_goal', 'memory', 'next_goal'],
      title: 'AgentBrain',
      type: 'object',
    },
    ClickElementAction: {
      properties: {
        desc: {
          title: 'Intent',
          type: 'string',
          description: 'Very short explanation of the intent or purpose for calling this action',
        },
        index: {
          title: 'Index',
          type: 'integer',
        },
        xpath: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
          title: 'Xpath',
        },
      },
      required: ['desc', 'index'],
      title: 'ClickElementAction',
      type: 'object',
    },
    DoneAction: {
      properties: {
        text: {
          title: 'Text',
          type: 'string',
        },
      },
      required: ['text'],
      title: 'DoneAction',
      type: 'object',
    },
    GoToUrlAction: {
      properties: {
        url: {
          title: 'Url',
          type: 'string',
        },
      },
      required: ['url'],
      title: 'GoToUrlAction',
      type: 'object',
    },
    InputTextAction: {
      properties: {
        desc: {
          title: 'Intent',
          type: 'string',
          description: 'Very short explanation of the intent or purpose for calling this action',
        },
        index: {
          title: 'Index',
          type: 'integer',
        },
        text: {
          title: 'Text',
          type: 'string',
        },
        xpath: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
          title: 'Xpath',
        },
      },
      required: ['desc', 'index', 'text'],
      title: 'InputTextAction',
      type: 'object',
    },
    NoParamsAction: {
      additionalProperties: true,
      description:
        'Accepts absolutely anything in the incoming data\nand discards it, so the final parsed model is empty.',
      properties: {},
      title: 'NoParamsAction',
      type: 'object',
    },
    OpenTabAction: {
      properties: {
        url: {
          title: 'Url',
          type: 'string',
        },
      },
      required: ['url'],
      title: 'OpenTabAction',
      type: 'object',
    },
    ScrollAction: {
      properties: {
        desc: {
          title: 'Intent',
          type: 'string',
          description: 'Very short explanation of the intent or purpose for calling this action',
        },
        amount: {
          anyOf: [
            {
              type: 'integer',
            },
            {
              type: 'null',
            },
          ],
          title: 'Amount',
        },
      },
      required: ['desc'],
      title: 'ScrollAction',
      type: 'object',
    },
    SearchGoogleAction: {
      properties: {
        query: {
          title: 'Query',
          type: 'string',
        },
      },
      required: ['query'],
      title: 'SearchGoogleAction',
      type: 'object',
    },
    SendKeysAction: {
      properties: {
        desc: {
          title: 'Intent',
          type: 'string',
          description: 'Very short explanation of the intent or purpose for calling this action',
        },
        keys: {
          title: 'Keys',
          type: 'string',
        },
      },
      required: ['desc', 'keys'],
      title: 'SendKeysAction',
      type: 'object',
    },
    SwitchTabAction: {
      properties: {
        tab_id: {
          title: 'Page Id',
          type: 'integer',
        },
      },
      required: ['tab_id'],
      title: 'SwitchTabAction',
      type: 'object',
    },
    cache_content_parameters: {
      properties: {
        content: {
          title: 'Content',
          type: 'string',
        },
      },
      required: ['content'],
      title: 'cache_content_parameters',
      type: 'object',
    },
    get_dropdown_options_parameters: {
      properties: {
        index: {
          title: 'Index',
          type: 'integer',
        },
      },
      required: ['index'],
      title: 'get_dropdown_options_parameters',
      type: 'object',
    },
    scroll_to_text_parameters: {
      properties: {
        desc: {
          title: 'Intent',
          type: 'string',
          description: 'Very short explanation of the intent or purpose for calling this action',
        },
        text: {
          title: 'Text',
          type: 'string',
        },
      },
      required: ['desc', 'text'],
      title: 'scroll_to_text_parameters',
      type: 'object',
    },
    select_dropdown_option_parameters: {
      properties: {
        index: {
          title: 'Index',
          type: 'integer',
        },
        text: {
          title: 'Text',
          type: 'string',
        },
      },
      required: ['index', 'text'],
      title: 'select_dropdown_option_parameters',
      type: 'object',
    },
  },
  properties: {
    current_state: {
      $ref: '#/$defs/AgentBrain',
    },
    action: {
      items: {
        $ref: '#/$defs/ActionModel',
      },
      title: 'Action',
      type: 'array',
    },
  },
  required: ['current_state', 'action'],
  title: 'AgentOutput',
  type: 'object',
};
