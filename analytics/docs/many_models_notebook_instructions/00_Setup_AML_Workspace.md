
# Setup AML Workspace

Please follow all instructions in this notebook.

Consider modifying the below section

## 3.0 Create compute cluster

When you reach this final cell, consider using a smaller VM as the listed VM is not needed for processing the example data.  A 'STANDARD_DS3_V2' VM will work fine.

```python
compute_config = AmlCompute.provisioning_configuration(vm_size='STANDARD_DS3_V2',
                                                        min_nodes=0,
                                                        max_nodes=20)
```
