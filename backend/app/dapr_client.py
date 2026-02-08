import os
import json
import logging
from typing import Any, Dict, Optional

# Check if dapr-client is installed
try:
    from dapr.clients import DaprClient
    DAPR_AVAILABLE = True
except ImportError:
    DAPR_AVAILABLE = False
    DaprClient = None

logger = logging.getLogger(__name__)

class AppDaprClient:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AppDaprClient, cls).__new__(cls)
            cls._instance._init()
        return cls._instance
    
    def _init(self):
        self.enabled = os.getenv("ENABLE_DAPR", "false").lower() == "true"
        self.pubsub_name = os.getenv("DAPR_PUBSUB_NAME", "pubsub")
        self.client = None
        
        if self.enabled and DAPR_AVAILABLE:
            try:
                self.client = DaprClient()
                logger.info("Dapr Client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Dapr client: {e}")
                
    def publish_event(self, topic: str, data: Dict[str, Any]) -> bool:
        """
        Publish an event to the configured PubSub component.
        Returns True if successful, False otherwise.
        """
        if not self.enabled or not self.client:
            logger.debug(f"Dapr disabled or unavailable. Skipping publish to {topic}")
            return False
            
        try:
            self.client.publish_event(
                pubsub_name=self.pubsub_name,
                topic_name=topic,
                data=json.dumps(data),
                data_content_type='application/json'
            )
            logger.info(f"Published event to {topic}")
            return True
        except Exception as e:
            logger.error(f"Failed to publish event to {topic}: {e}")
            return False

# Singleton instance
dapr_client = AppDaprClient()
